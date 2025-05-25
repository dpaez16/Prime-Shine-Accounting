package wave

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type WaveBusinessInfo struct {
	BusinessID         string `json:"businessId"`
	BusinessName       string `json:"businessName"`
	ProductID          string `json:"productId"`
	ProductName        string `json:"productName"`
	IdentityBusinessID string `json:"identityBusinessID"`
}

type WaveBusinessProduct struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type WaveBusiness struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Products struct {
		Edges []struct {
			Node WaveBusinessProduct `json:"node"`
		} `json:"edges"`
	} `json:"products"`
}

type businessesQueryData struct {
	Businesses struct {
		Edges []struct {
			Node WaveBusiness `json:"node"`
		} `json:"edges"`
	} `json:"businesses"`
}

func GetBusinessInfo() (*WaveBusinessInfo, error) {
	body := WaveGraphQLBody{
		Query: `
					query {
						businesses {
							edges {
								node {
									id
									name
									products {
										edges {
											node {
												id
												name
											}
										}
									}
								}
							}
						}
					}
		`,
	}

	response, err := createWaveGraphQLRequest(body)
	if err != nil {
		return nil, errors.Wrap(err, "createWaveGraphQLRequest")
	}

	var businessesData businessesQueryData
	err = json.Unmarshal([]byte(response), &businessesData)
	if err != nil {
		return nil, errors.Wrap(err, "json deserialization")
	}

	businessName := WAVE_BUSINESS_NAME
	businessEdges := businessesData.Businesses.Edges
	var foundBusiness *WaveBusiness = nil

	for _, edge := range businessEdges {
		business := edge.Node
		if business.Name == businessName {
			foundBusiness = &business
			break
		}
	}

	if foundBusiness == nil {
		return nil, errors.New("Could not find primary Wave business data")
	}

	productName := WAVE_CLEANING_PRODUCT_NAME
	productEdges := foundBusiness.Products.Edges
	var foundProduct *WaveBusinessProduct = nil

	for _, edge := range productEdges {
		product := edge.Node
		if product.Name == productName {
			foundProduct = &product
			break
		}
	}

	if foundProduct == nil {
		return nil, errors.New("Could not find primary Wave product data")
	}

	internalBusinessID, err := GetInternalBusinessInfo()
	if err != nil {
		return nil, errors.Wrap(err, "GetInternalBusinessInfo")
	}

	businessInfo := WaveBusinessInfo{
		BusinessID:         foundBusiness.ID,
		BusinessName:       foundBusiness.Name,
		ProductID:          foundProduct.ID,
		ProductName:        foundProduct.Name,
		IdentityBusinessID: internalBusinessID,
	}

	return &businessInfo, nil
}
