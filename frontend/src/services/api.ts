export const fetchData = async (sector: string, subsector_1: string, subsector_2: string) => {
    const apiUrl = 'https://5000-idx-cdri-data-hub-1743150338726.cluster-nx3nmmkbnfe54q3dd4pfbgilpc.cloudworkstations.dev/api/query-data';

    // Request payload
    const data = {
        sector: sector,
        subsector_1: subsector_1,
        subsector_2: subsector_2
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