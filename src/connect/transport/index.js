// Sceglie il trasporto dall'indirizzo: https:// ⇒ cassetta HTTP (relayClient); wss:// ⇒ broker MQTT pubblico (mqttRelay).
// Stessa interfaccia: put(topic, bytes) / fetchNew(topic, after). Tutto il resto del sistema non sa quale sia.
import { createRelayClient } from './relayClient.js';
import { createMqttRelay } from './mqtt/mqttRelay.js';

export const isRelayUrl = (u) => typeof u === 'string' && u.length <= 120 && /^(https|wss):\/\/[A-Za-z0-9.-]+(:\d+)?(\/[A-Za-z0-9._~\/-]*)?$/.test(u);

export const createTransport = ({ url, fetchImpl, WebSocketImpl, now }) =>
    url.startsWith('wss://') ? createMqttRelay({ url, WebSocketImpl, now }) : createRelayClient({ baseUrl: url, fetchImpl });
