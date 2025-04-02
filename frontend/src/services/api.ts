export const fetchData = async (sector: string, series_name: string) => {
    const apiUrl = 'https://5000-idx-cdri-data-hub-1743150338726.cluster-nx3nmmkbnfe54q3dd4pfbgilpc.cloudworkstations.dev/api/query-data';

    // Request payload
    const data = {
        sector: sector,
        series_name: series_name
    };

    try {
        // Make sure to use POST and send the body as JSON
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Set the header to tell the server it's JSON
            },
            body: JSON.stringify(data),  // Send the data as a JSON string
        });

        // Check if response is not empty
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};


export const fetchMenu = async () => {
    const apiUrl = 'https://5000-idx-cdri-data-hub-1743150338726.cluster-nx3nmmkbnfe54q3dd4pfbgilpc.cloudworkstations.dev/api/query-menu';

    try {
        // Make sure to use POST and send the body as JSON
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',  // Set the header to tell the server it's JSON
            }
        });

        // Check if response is not empty
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};