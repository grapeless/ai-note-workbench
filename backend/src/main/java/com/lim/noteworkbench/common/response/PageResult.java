package com.lim.noteworkbench.common.response;

import java.util.List;

/**
 * 通用的数据传输对象，用于表示分页查询的结果。
 *
 * @param <T>      记录列表中每个元素的类型
 * @param pageNum  当前页码，从1开始计数
 * @param pageSize 每页显示的记录数
 * @param total    总记录数
 * @param records  本次查询到的的数据
 */
public record PageResult<T>(
        int pageNum,
        int pageSize,
        int total,
        List<T> records) {
}
