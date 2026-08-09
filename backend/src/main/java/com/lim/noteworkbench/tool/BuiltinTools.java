package com.lim.noteworkbench.tool;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class BuiltinTools {

    @Tool(description = "获取指定 IANA 时区的当前日期和时间，例如 Asia/Shanghai")
    public String getCurrentTime(@ToolParam(description = "IANA 时区，例如 Asia/Shanghai") String zoneId){
        return ZonedDateTime.now(ZoneId.of(zoneId)).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }
}
