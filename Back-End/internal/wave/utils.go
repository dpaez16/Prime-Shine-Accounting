package wave

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/pkg/errors"
)

type WavePageInfoData struct {
	CurrentPage int `json:"currentPage"`
	TotalPages  int `json:"totalPages"`
	TotalCount  int `json:"totalCount"`
}

type WaveInputError map[string]any

type WaveGraphQLVariables map[string]any

type WaveGraphQLBody struct {
	Query     string               `json:"query"`
	Variables WaveGraphQLVariables `json:"variables"`
}

type WaveGraphQLError struct {
	Message   string            `json:"message"`
	Locations *[]map[string]any `json:"locations"`
}

type WaveGraphQLResponse struct {
	Data   map[string]any      `json:"data"`
	Errors *[]WaveGraphQLError `json:"errors"`
}

func getWaveGraphQLSecret() string {
	return os.Getenv("WAVE_GRAPHQL_URL")
}

func getWaveAPIToken() string {
	return os.Getenv("WAVE_TOKEN")
}

func getWaveBusinessURL() string {
	return os.Getenv("WAVE_BUSINESS_URL")
}

func transformErrorsArrayIntoError(graphQLErrors []WaveGraphQLError) string {
	var errorMessages []string

	for _, graphQLError := range graphQLErrors {
		if graphQLError.Locations != nil {
			errorMessages = append(errorMessages, fmt.Sprintf("(%v: %v)", graphQLError.Message, *graphQLError.Locations))
		} else {
			errorMessages = append(errorMessages, graphQLError.Message)
		}
	}

	return strings.Join(errorMessages, ", ")
}

func createWaveGraphQLRequest(body WaveGraphQLBody) (string, error) {
	serializedBody, err := json.MarshalIndent(body, "", "\t")
	if err != nil {
		return "", errors.Wrap(err, "json serialization")
	}

	requestBody := bytes.NewBuffer(serializedBody)
	req, err := http.NewRequest("POST", getWaveGraphQLSecret(), requestBody)
	if err != nil {
		return "", errors.Wrap(err, "creating the POST request")
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %v", getWaveAPIToken()))

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return "", errors.Wrap(err, "dispatching the POST request")
	}

	defer response.Body.Close()

	responseBody, err := io.ReadAll(response.Body)
	if err != nil {
		return "", errors.Wrap(err, "reading POST response body")
	}

	responseBodyText := string(responseBody)

	if response.StatusCode != http.StatusOK && response.StatusCode != http.StatusCreated {
		return "", errors.Wrap(err, responseBodyText)
	}

	var responseStruct WaveGraphQLResponse
	err = json.Unmarshal(responseBody, &responseStruct)
	if err != nil {
		return "", errors.Wrap(err, "json deserialization")
	}

	if responseStruct.Errors != nil {
		return "", errors.New(transformErrorsArrayIntoError(*responseStruct.Errors))
	}

	// we serialize the data so that the caller can deserialize the data to whatever structure they desire.
	data, err := json.Marshal(responseStruct.Data)
	if err != nil {
		return "", errors.Wrap(err, "json serialization")
	}

	return string(data), nil
}

func createWaveBusinessAPIRequest(method string, path string, body *map[string]any) (string, error) {
	serializedBody, err := json.MarshalIndent(body, "", "\t")
	if err != nil {
		return "", errors.Wrap(err, "json serialization")
	}

	requestBody := bytes.NewBuffer(serializedBody)
	req, err := http.NewRequest(method, getWaveBusinessURL()+path, requestBody)
	if err != nil {
		return "", errors.Wrapf(err, "creating the %v request", method)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %v", getWaveAPIToken()))

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return "", errors.Wrapf(err, "dispatching the %v request", method)
	}

	defer response.Body.Close()

	responseBody, err := io.ReadAll(response.Body)
	if err != nil {
		return "", errors.Wrapf(err, "reading %v response body", method)
	}

	responseBodyText := string(responseBody)

	if response.StatusCode != http.StatusOK && response.StatusCode != http.StatusCreated {
		return "", errors.Wrap(err, responseBodyText)
	}

	return responseBodyText, nil
}
