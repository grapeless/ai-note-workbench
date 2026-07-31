package com.lim.noteworkbench.config.mybatis;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.sql.*;
import java.util.Map;

@Component
@MappedTypes(Map.class)
@MappedJdbcTypes(value = JdbcType.OTHER, includeNullJdbcType = true)
public class JsonbTypeHandler extends BaseTypeHandler<Map<String, Object>> {
    private final JsonMapper jsonMapper;

    public JsonbTypeHandler(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    @Override
    public void setNonNullParameter(PreparedStatement ps,
                                    int i,
                                    Map<String, Object> parameter,
                                    JdbcType jdbcType) throws SQLException {
        try {
            String json = jsonMapper.writeValueAsString(parameter);
            ps.setObject(i, json, Types.OTHER);
        } catch (Exception e) {
            throw new SQLException("序列化 Chunk metadata 失败", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parse(String json)
            throws SQLException {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return jsonMapper.readValue(json, Map.class);
        } catch (Exception exception) {
            throw new SQLException("反序列化 Chunk metadata 失败", exception);
        }
    }

    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parse(rs.getString(columnName));
    }

    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parse(rs.getString(columnIndex));
    }

    @Override
    public Map<String, Object> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parse(cs.getString(columnIndex));
    }
}
