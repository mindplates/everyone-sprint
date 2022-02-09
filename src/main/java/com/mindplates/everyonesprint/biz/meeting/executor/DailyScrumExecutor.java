package com.mindplates.everyonesprint.biz.meeting.executor;

import lombok.extern.java.Log;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Log
public class DailyScrumExecutor {
    @Async("executor")
    public void dailyScrumProcess(String code) throws InterruptedException {

        for (int i = 0; i < 100; i += 1) {
            Thread.sleep(1000);
            log.info("" + Thread.currentThread().getId());
            log.info("test");
        }
    }
}
