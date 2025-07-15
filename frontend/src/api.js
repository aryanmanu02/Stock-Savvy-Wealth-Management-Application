import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

export async function addStock(stock) {
  const response = await axios.post(`${API_BASE}/stocks`, stock);
  return response.data;
}

export async function getStocks() {
  const response = await axios.get(`${API_BASE}/stocks`);
  return response.data.stocks;
}

export async function clearStocks() {
  const response = await axios.delete(`${API_BASE}/stocks`);
  return response.data;
}

export async function analyzePortfolio() {
  const response = await axios.post(`${API_BASE}/analyze`);
  return response.data;
}

export function getFileUrl(filename) {
  return `${API_BASE}/files/${filename}`;
} 