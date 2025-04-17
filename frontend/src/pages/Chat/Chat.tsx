import React, { useState, useEffect } from 'react';
import { Stack, Text, Paper, Loader, Button, TextInput } from '@mantine/core';
import ReactECharts from 'echarts-for-react';
import { fetchChat } from '../../services/api';

// Define the expected response type
interface ChatResponse {
  success: boolean;
  chartConfig?: Record<string, any>;
  query?: string;
  msg?: string;
}

const Chat: React.FC = () => {
  // State for API response, error, loading, and user input
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('Generate a line graph with sales data');

  const fetchMenuData = async (userQuery: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const result = await fetchChat(userQuery);
      setResponse(result);
      console.log('API Response:', result);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch chart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData(query);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    fetchMenuData(query);
  };

  return (
    <Stack gap="md" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Input Form */}
      <Paper shadow="sm" p="md" withBorder>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Chart Query"
            placeholder="e.g., Generate a line graph with sales data"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            style={{ marginBottom: '10px' }}
          />
          <Button type="submit" color="blue" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Chart'}
          </Button>
        </form>
      </Paper>

      {/* Error Message */}
      {error && (
        <Text color="red" size="sm">
          Error: {error}
        </Text>
      )}

      {/* Loading State */}
      {loading && (
        <Paper shadow="sm" p="md" withBorder style={{ textAlign: 'center' }}>
          <Loader size="sm" />
          <Text size="sm">Loading chart...</Text>
        </Paper>
      )}

      {/* Response Display */}
      {response && (
        <Paper shadow="sm" p="md" withBorder>
          {response.success ? (
            <>
              <ReactECharts
                option={response.chartConfig || {}}
                opts={{ renderer: 'svg' }}
                style={{ height: '400px', width: '100%', marginTop: '10px' }}
              />
            </>
          ) : (
            <Text color="red" size="sm">
              API Error: {response.msg || 'Failed to generate chart'}
            </Text>
          )}
        </Paper>
      )}
    </Stack>
  );
};

export default Chat;