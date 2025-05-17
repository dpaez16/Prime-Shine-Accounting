package wave

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type WaveCustomerProvince struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

type WaveCustomerAddress struct {
	AddressLine1 string               `json:"addressLine1"`
	AddressLine2 string               `json:"addressLine2"`
	City         string               `json:"city"`
	Province     WaveCustomerProvince `json:"province"`
	PostalCode   string               `json:"postalCode"`
}

type WaveCustomer struct {
	ID      string              `json:"id"`
	Name    string              `json:"name"`
	Email   string              `json:"email"`
	Mobile  string              `json:"mobile"`
	Phone   string              `json:"phone"`
	Address WaveCustomerAddress `json:"address"`
}

type WaveCustomersQueryData struct {
	Business struct {
		Customers struct {
			PageInfo WavePageInfoData `json:"pageInfo"`
			Edges    []struct {
				Node WaveCustomer `json:"node"`
			} `json:"edges"`
		} `json:"customers"`
	} `json:"business"`
}

func GetCustomers(businessID string, pageNum int, pageSize int) (*[]WaveCustomer, *WavePageInfoData, error) {
	body := WaveGraphQLBody{
		Query: `
					query($businessId: ID!, $pageNum: Int!, $pageSize: Int!) {
						business(id: $businessId) {
							customers(page: $pageNum, pageSize: $pageSize, sort: [NAME_ASC]) {
								pageInfo {
									currentPage
									totalPages
									totalCount
								}
								edges {
									node {
										id
										name
									}
								}
							}
						}
					}
		`,
		Variables: map[string]any{
			"businessId": businessID,
			"pageNum":    pageNum,
			"pageSize":   pageSize,
		},
	}

	response, err := createWaveGraphQLRequest(body)
	if err != nil {
		return nil, nil, errors.Wrap(err, "createWaveGraphQLRequest")
	}

	var queryData WaveCustomersQueryData
	err = json.Unmarshal([]byte(response), &queryData)
	if err != nil {
		return nil, nil, errors.Wrap(err, "json deserialization")
	}

	var customers []WaveCustomer
	for _, edge := range queryData.Business.Customers.Edges {
		customers = append(customers, edge.Node)
	}

	return &customers, &queryData.Business.Customers.PageInfo, nil
}

func GetAllCustomers(businessID string) (*[]WaveCustomer, error) {
	pageSize := 500
	pageNum := 1
	var allCustomers []WaveCustomer

	for {
		customers, pageInfo, err := GetCustomers(businessID, pageNum, pageSize)
		if err != nil {
			return nil, errors.Wrapf(err, "GetCustomers - page %v", pageNum)
		}

		allCustomers = append(allCustomers, *customers...)

		if pageNum == pageInfo.TotalPages {
			break
		}

		pageNum += 1
	}

	return &allCustomers, nil
}

type WaveCustomerQueryData struct {
	Business struct {
		Customer WaveCustomer `json:"customer"`
	} `json:"business"`
}

func GetCustomer(businessID string, customerID string) (*WaveCustomer, error) {
	body := WaveGraphQLBody{
		Query: `
					query($businessId: ID!, $customerId: ID!) {
						business(id: $businessId) {
							customer(id: $customerId) {
								id
								name
								email
								mobile
								phone
								address {
									addressLine1
									addressLine2
									city
									province {
										code
										name
									}
									postalCode
								}
							}
						}
					}
		`,
		Variables: map[string]any{
			"businessId": businessID,
			"customerId": customerID,
		},
	}

	response, err := createWaveGraphQLRequest(body)
	if err != nil {
		return nil, errors.Wrap(err, "createWaveGraphQLRequest")
	}

	var queryData WaveCustomerQueryData
	err = json.Unmarshal([]byte(response), &queryData)
	if err != nil {
		return nil, errors.Wrap(err, "json deserialization")
	}

	customer := queryData.Business.Customer
	return &customer, nil
}
