export type WaveBusinessAccountGroup = {
    value: number;
    display_name: string;
};

export type WaveBusinessAccountSubGroup = {
    value: number;
    display_name: string;
};

export type WaveBusinessAccountAccrualAnchorTier = {
    value: number;
    display_name: string;
};

export type WaveBusinessAccountNormalBalanceType = {
    value: number;
    display_name: string;
};

export type WaveBusinessAccount = {
    archived: boolean;
    active: boolean;
    account_name: string;
    wave_classic_pk: number;
    group: WaveBusinessAccountGroup;
    sub_group: WaveBusinessAccountSubGroup;
    accrual_anchor_tier: WaveBusinessAccountAccrualAnchorTier;
    normal_balance_type: WaveBusinessAccountNormalBalanceType;
};
