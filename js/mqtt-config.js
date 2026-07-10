// ============================================================
//  MQTT 配置
// ============================================================
// 本方案使用公共 MQTT 代理，无需注册任何账号。
// 程序会按顺序尝试连接，第一个连上的就是当前使用的代理。
// ============================================================

const MQTT_CONFIG = {
    brokerURLs: [
        'wss://broker-cn.emqx.io:8084/mqtt',   // EMQ X 国内节点（推荐）
        'wss://broker.emqx.io:8084/mqtt',      // EMQ X 国际节点
        'wss://broker.hivemq.com:8884/mqtt'    // HiveMQ
    ],
    topicPrefix: 'star_cultivation'
};

function mqttAvailable() {
    return typeof mqtt !== 'undefined';
}
