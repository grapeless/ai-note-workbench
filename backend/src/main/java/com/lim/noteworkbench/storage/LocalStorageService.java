package com.lim.noteworkbench.storage;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocalStorageService implements StorageService {
    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("pdf", "txt", "md", "markdown");

    private final StorageProperties storageProperties;

    @Override
    public String store(Long workspaceId, MultipartFile file) {
        if (workspaceId == null) throw new IllegalArgumentException("workspaceId 不能为空");
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

        if (!ALLOWED_EXTENSIONS.contains(extension))
            throw new BusinessException(ResultCode.PARAMS_ERROR, "暂时只支持 PDF、TXT 和 Markdown 文件");

        Path uploadDirectory = Path.of(storageProperties.getRoot())
                .toAbsolutePath() //将配置的文件存储路径转为绝对路径
                .resolve("uploads") //追加路径：/uploads
                .resolve(workspaceId.toString()) //追加路径：/workspaceId
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

        Path root = Path.of(storageProperties.getRoot())
                .toAbsolutePath()
                .normalize();
        Path target = root.resolve(relativePath).normalize();

        if (!target.startsWith(root)) throw new IllegalArgumentException("非法文件路径");

        try {
            Files.deleteIfExists(target);
        } catch (IOException exception) {
            throw new UncheckedIOException("删除文件失败", exception);
        }
    }
}
