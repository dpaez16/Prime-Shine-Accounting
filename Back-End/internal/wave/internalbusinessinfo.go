package wave

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/pkg/errors"
)

type WaveInternalBusinessInfo struct {
	ID          string `json:"id"`
	CompanyName string `json:"company_name"`
	URL         string `json:"url"`
}

func GetInternalBusinessInfo() (string, error) {
	params := url.Values{}
	params.Set("include_personal", "false")

	path := fmt.Sprintf("/?%v", params.Encode())

	data, err := createWaveBusinessAPIRequest(http.MethodGet, path, nil)
	if err != nil {
		return "", errors.Wrap(err, "createWaveBusinessAPIRequest")
	}

	var businesses []WaveInternalBusinessInfo
	err = json.Unmarshal([]byte(data), &businesses)
	if err != nil {
		return "", errors.Wrap(err, "json deserialization")
	}

	businessName := WAVE_BUSINESS_NAME
	for _, business := range businesses {
		if business.CompanyName == businessName {
			return business.ID, nil
		}
	}

	return "", errors.New("Could not find internal business info")
}
