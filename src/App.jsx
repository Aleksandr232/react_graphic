import React, { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './App.css'

const App = () => {
  const [bybitData, setBybitData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Функция для обработки данных по логике из JS кода
  const processProfitPoints = (profitPoints) => {
    if (!profitPoints || !Array.isArray(profitPoints)) return []
    
    let vSum = 1
    const processedData = []

    for (const item of profitPoints) {
      vSum *= (Number(item.rValue) + 1)
      const profitPercent = (vSum - 1) * 100
      
      processedData.push({
        date: item.date,
        value: parseFloat(profitPercent.toFixed(2))
      })
    }

    return processedData
  }

  // Загрузка данных с API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://iipetrov.ru/php/autofllow.php')
        const result = await response.json()

        if (result && result.object) {
          // Обработка данных Bybit из 4_bybit__profitPoint
          if (result.object['4_bybit__profitPoint']) {
            const bybitProcessed = processProfitPoints(result.object['4_bybit__profitPoint'])
            setBybitData(bybitProcessed)
          }
        }
        setLoading(false)
      } catch (err) {
        setError('Ошибка загрузки данных: ' + err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Дата: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)}%`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Форматирование даты для отображения
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  }

  // Подготовка данных для графика с форматированными датами
  const prepareChartData = (data) => {
    return data.map(item => ({
      ...item,
      dateFormatted: formatDate(item.date)
    }))
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">Загрузка данных...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>📊 График прибыльности стратегии</h1>
        <p>Данные загружены с API</p>
      </div>

      {bybitData.length > 0 ? (
        <div className="chart-wrapper">
          <h2 className="chart-title">Агрессивный Bybit</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={prepareChartData(bybitData)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorBybit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="dateFormatted" 
                  stroke="#666"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#666"
                  label={{ value: 'Прибыль (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Прибыль (%)"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBybit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="no-data">Нет данных для отображения</div>
      )}
    </div>
  )
}

export default App

