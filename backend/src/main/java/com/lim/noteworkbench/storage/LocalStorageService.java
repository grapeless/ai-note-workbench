package com.lim.noteworkbench.storage;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.config.properties.StorageProperties;
import com.lim.noteworkbench.model.enums.DocumentType;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.Comparator;
import java.util.Locale;
import java.util.UUID;

/**
 * 本地存储实现
 */
@Service
@RequiredArgsConstructor
public class LocalStorageService implements StorageService {
    private final StorageProperties storageProperties;

    @Override
    public String store(Long collectionId, MultipartFile file) {
        if (collectionId == null) throw new IllegalArgumentException("collectionId 不能为空");
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("上传文件不能为空");

        //获取上传的文件的原始名称
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "文件名不能为空");
        }
        originalFilename = StringUtils.cleanPath(originalFilename);

        //获取上传的文件的拓展名
        String extension = StringUtils.getFilenameExtension(originalFilename);
        if (extension == null || extension.isBlank()) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "文件缺少扩展名");
        }
        extension = extension.toLowerCase(Locale.ROOT);

        Path uploadDirectory = Path.of(storageProperties.getRoot())
                .toAbsolutePath() //将配置的文件存储路径转为绝对路径
                .resolve("uploads") //追加路径：/uploads
                .resolve(collectionId.toString()) // 追加路径：/collectionId
                .normalize(); //然后整理一次

        Path target = uploadDirectory
                .resolve(UUID.randomUUID() + "." + extension)
                .normalize();

        if (!target.startsWith(uploadDirectory)) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "非法文件路径");
        }

        try {
            //创建目录
            Files.createDirectories(uploadDirectory);
            //写入文件
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            //计算target相对于设定的存储路径的值返回
            return Path.of(storageProperties.getRoot())
                    .toAbsolutePath()
                    .normalize().relativize(target)
                    .toString()
                    .replace(File.separatorChar, '/');

        } catch (IOException exception) {
            throw new UncheckedIOException("保存上传文件失败", exception);
        }
    }

    @Override
    public void delete(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;

        Path target = resolveSafePath(relativePath);

        try {
            Files.deleteIfExists(target);
        } catch (IOException exception) {
            throw new UncheckedIOException("删除文件失败", exception);
        }
    }

    @Override
    public void deleteCollection(Long collectionId) {
        Path uploadsRoot = Path.of(storageProperties.getRoot())
                .toAbsolutePath()
                .normalize()
                .resolve("uploads")
                .normalize();
        Path collectionDirectory = uploadsRoot.resolve(collectionId.toString()).normalize();

        if (!collectionDirectory.startsWith(uploadsRoot) || collectionDirectory.equals(uploadsRoot)) {
            throw new BusinessException(ResultCode.PARAMS_ERROR, "非法集合文件路径");
        }

        if (!Files.exists(collectionDirectory)) return;

        try (var paths = Files.walk(collectionDirectory)) {
            paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException exception) {
                    throw new UncheckedIOException("删除集合文件失败", exception);
                }
            });
        } catch (IOException exception) {
            throw new UncheckedIOException("删除集合文件失败", exception);
        }
    }

    @Override
    public Resource load(String relativePath) {
        Path target = resolveSafePath(relativePath);

        if (!Files.isRegularFile(target)) throw new BusinessException(ResultCode.NOT_FOUND_ERROR, "源文件不存在");

        return new FileSystemResource(target);
    }

    @Override
    public String readText(String relativePath) {
        Path target = resolveSafePath(relativePath);

        try {
            return Files.readString(target, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("读取文本文档失败", e);
        }
    }

    @Override
    public void writeText(String relativePath, String content) {
        Path target = resolveSafePath(relativePath);

        try {
            Files.writeString(target, content,
                    StandardCharsets.UTF_8, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("写入文本文档失败", e);
        }
    }

    @Override
    public String createText(Long knowledgeCollectionId, DocumentType documentType, String content) {
        //返回指定知识库集合的文件存储目录。
        Path uploadDirectory = Path.of(storageProperties.getRoot())
                .toAbsolutePath()
                .normalize()
                .resolve("uploads")
                .resolve(knowledgeCollectionId.toString())
                .normalize();

        //用UUID替换真实文件名
        Path target = uploadDirectory.resolve(UUID.randomUUID() + "." + documentType.getExtension())
                .normalize();

        try {
            Files.createDirectories(uploadDirectory);
            Files.writeString(target, content,
                    StandardCharsets.UTF_8, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);

            return Path.of(storageProperties.getRoot())
                    .toAbsolutePath()
                    .normalize()
                    .relativize(target)
                    .toString()
                    .replace(File.separatorChar, '/');
        } catch (IOException e) {
            throw new UncheckedIOException("创建文本文档失败", e);
        }
    }

    /**
     * 将相对路径解析为相对于存储根目录的安全绝对路径，并检查是否存在路径穿越攻击。
     * 若解析后的目标路径不在存储根目录下，则抛出 {@link BusinessException}。
     *
     * @param relativePath 相对于存储根目录的文件路径
     * @return 解析后的安全绝对路径
     */
    private Path resolveSafePath(String relativePath) {
        //将配置文件配置的root的相对路径转为绝对路径
        Path root = Path.of(storageProperties.getRoot())
                .toAbsolutePath()
                .normalize();

        //将传进来的目标文件相对路径进行拼接
        Path target = root.resolve(relativePath).normalize();

        //检查是否发生路径穿越
        if (!target.startsWith(root)) throw new BusinessException(ResultCode.PARAMS_ERROR, "非法文件路径");

        return target;
    }
}
