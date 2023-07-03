<template>
    <h1>财务分析</h1>
    <van-col span="12" class="compare-border-right">
        <div class="compare">
            <div class="title">今日供水量</div>
            <div class="value">
                <!-- {{ visitData.waterSupply.today }} -->
                1232
                <span class="unit">万m³</span>
            </div>
            <div class="trend">
                <span class="trend-label">昨日同期 &nbsp;</span>
                <span style="font-size: 12px">
                    <!-- {{ visitData.waterSupply.yesterday }}万m³ -->
                    1232
                </span>
            </div>
        </div>
    </van-col>
</template>