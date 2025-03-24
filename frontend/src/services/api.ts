export const fetchData = async (sector: string, seriesName: string) => {
    const apiUrl = 'https://legendary-space-robot-rvgrp55v465hw6r-5000.app.github.dev/query-data';

    // Request payload
    const data = {
        sector: sector,
        series_name: seriesName
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
        console.log('Fetched data:', result);
        return result;
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};