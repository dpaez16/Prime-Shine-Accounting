package wave

import (
	"encoding/json"
	"net/http"

	"github.com/pkg/errors"
)

type WaveInternalBusinessInfo struct {
	ID          string `json:"id"`
	CompanyName string `json:"company_name"`
	URL         string `json:"url"`
}

func GetInternalBusinessInfo() (string, error) {
	data, err := createWaveBusinessAPIRequest(http.MethodGet, "/?include_personal=false", nil)
	if err != nil {
		return "", errors.Wrap(err, "createWaveBusinessAPIRequest")
	}

	var businesses []WaveInternalBusinessInfo
	err = json.Unmarshal([]byte(data), &businesses)
	if err != nil {
		return "", errors.Wrap(err, "json deserialization")
	}

	businessName := GetWaveBusinessName()
	for _, business := range businesses {
		if business.CompanyName == businessName {
			return business.ID, nil
		}
	}

	return "", errors.New("Could not find internal business info")
}
