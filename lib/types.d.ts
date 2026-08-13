export interface PerkoxReward {
    amount: number;
    txid: string;
    status: string;
    publisher_id: number;
    player_id: string;
    timestamp: number;
    type?: string;
}
export interface PerkoxInitConfig {
    appId: string;
    sdkKey: string;
    playerId?: string;
    beta?: boolean;
}
export interface PerkoxOfferwallConfig extends PerkoxInitConfig {
    playerId: string;
    onReward?: (reward: PerkoxReward) => void;
    onClose?: () => void;
}
export interface PerkoxOfferwallOptions {
    appId?: string;
    sdkKey?: string;
    playerId?: string;
    beta?: boolean;
}
export interface PerkoxOfferwallProps extends PerkoxOfferwallConfig {
    visible?: boolean;
    style?: any;
}
