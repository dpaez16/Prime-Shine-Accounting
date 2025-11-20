package wave

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/pkg/errors"
)

type WaveBusinessAccountSubField struct {
	Value       int    `json:"value"`
	DisplayName string `json:"display_name"`
}

type WaveBusinessAccount struct {
	GUID              string                      `json:"guid"`
	Sequence          int                         `json:"sequence"`
	Archived          bool                        `json:"archived"`
	Active            bool                        `json:"active"`
	AccountName       string                      `json:"account_name"`
	Group             WaveBusinessAccountSubField `json:"group"`
	SubGroup          WaveBusinessAccountSubField `json:"sub_group"`
	AccuralAnchorTier WaveBusinessAccountSubField `json:"accrual_anchor_tier"`
	NormalBalanceType WaveBusinessAccountSubField `json:"normal_balance_type"`
	ID                int                         `json:"wave_classic_pk"`
}

type queryWaveBusinessAccountsData struct {
	Accounts []WaveBusinessAccount `json:"accounts"`
}

func GetBusinessAccounts(identityBusinessID string) (*[]WaveBusinessAccount, error) {
	path := fmt.Sprintf("/%v/accountsv2/anchor/", identityBusinessID)

	response, err := createWaveBusinessAPIRequest(http.MethodGet, path, nil)
	if err != nil {
		return nil, errors.Wrap(err, "createWaveBusinessAPIRequest")
	}

	var data queryWaveBusinessAccountsData
	err = json.Unmarshal([]byte(response), &data)
	if err != nil {
		return nil, errors.Wrap(err, "json deserialization")
	}

	var filteredAccounts []WaveBusinessAccount
	for _, account := range data.Accounts {
		if account.Active && !account.Archived {
			filteredAccounts = append(filteredAccounts, account)
		}
	}

	return &filteredAccounts, nil
}
