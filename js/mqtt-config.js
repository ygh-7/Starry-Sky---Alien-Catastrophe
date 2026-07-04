// ============================================================
//  MQTT 配置
// ============================================================
// 使用说明：
// 1. 本方案使用公共 MQTT 代理，无需注册任何账号
// 2. 默认使用 EMQ X 国内节点，如需更换可修改 brokerURL
// 3. 如果某个 broker 连接不上，可尝试列表中的其他地址
// ============================================================

const MQTT_CONFIG = {
    // 推荐：EMQ X 国内节点
    brokerURL: 'wss://broker-cn.emqx.io:8084/mqtt',
    // 备用：EMQ X 国际节点
    // brokerURL: 'wss://broker.emqx.io:8084/mqtt',
    // 备用：HiveMQ 公共代理
    // brokerURL: 'wss://broker.hivemq.com:8884/mqtt',
    topicPrefix: 'star_cultivation'
};

function mqttAvailable() {
    return typeof mqtt !== 'undefined' && !!MQTT_CONFIG.brokerURL;
}
