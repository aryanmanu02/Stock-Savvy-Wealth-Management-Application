# Portfolio Analyzer - Advanced Analysis & AI Insights

A modern, sophisticated portfolio analysis application with a sleek black and white UI design, featuring advanced stock management capabilities and AI-powered insights.

## 🎨 Modern UI Features

- **Sleek Black & White Design**: Professional dark theme with white accents
- **Glass Morphism Effects**: Modern backdrop blur and transparency effects
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Advanced Typography**: Inter font family for better readability
- **Interactive Elements**: Hover effects and smooth transitions

## 🚀 New Features

### Stock Management
- **Add Stocks**: Easily add new stocks with symbol, shares, and buy price
- **Edit Stocks**: Click the edit icon to modify existing stock details
- **Delete Stocks**: Remove individual stocks with confirmation
- **Real-time Updates**: Instant reflection of changes in the portfolio

### Portfolio Analysis
- **Comprehensive Metrics**: Risk analysis, diversification, and performance metrics
- **Visual Charts**: Interactive portfolio visualization
- **AI Insights**: Advanced AI-powered portfolio recommendations
- **Export Options**: Download charts, reports, and insights

## 🛠️ Technical Stack

### Frontend
- **React 18**: Modern React with hooks
- **Material-UI 5**: Advanced component library
- **Axios**: HTTP client for API communication
- **Inter Font**: Professional typography

### Backend
- **FastAPI**: High-performance Python web framework
- **MongoDB**: NoSQL database for stock storage
- **Pandas & NumPy**: Data analysis and manipulation
- **AI Integration**: LLM-powered insights

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MongoDB running locally

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

## 🎯 Usage

1. **Add Stocks**: Enter stock symbol, number of shares, and buy price
2. **Edit Stocks**: Click the edit icon next to any stock to modify details
3. **Delete Stocks**: Click the delete icon to remove stocks
4. **Analyze Portfolio**: Click "Analyze Portfolio" to generate comprehensive analysis
5. **View Results**: Explore metrics, charts, and AI insights
6. **Export Data**: Download reports and visualizations

## 🎨 UI Components

### Portfolio Form
- Modern input fields with currency symbols
- Real-time validation
- Responsive grid layout
- Clear portfolio option

### Results Dashboard
- Portfolio summary cards with key metrics
- Interactive stock table with edit/delete actions
- Performance metrics grid
- Download options for all reports

### Stock Edit Dialog
- Modal dialog for editing stock details
- Form validation
- Consistent styling with main theme

## 🔧 API Endpoints

- `POST /stocks` - Add new stock
- `GET /stocks` - Get all stocks
- `PUT /stocks/{id}` - Update stock
- `DELETE /stocks/{id}` - Delete individual stock
- `DELETE /stocks` - Clear all stocks
- `POST /analyze` - Analyze portfolio
- `GET /files/{filename}` - Download files

## 🎨 Design System

### Colors
- **Primary**: #ffffff (White)
- **Background**: #000000 (Black)
- **Surface**: #111111 (Dark Gray)
- **Border**: #333333 (Medium Gray)
- **Text**: #ffffff (White)
- **Text Secondary**: #cccccc (Light Gray)

### Typography
- **Font Family**: Inter
- **Weights**: 300, 400, 500, 600, 700, 800
- **Headings**: Bold with negative letter spacing
- **Body**: Regular weight for readability

### Components
- **Border Radius**: 8-12px for modern look
- **Shadows**: Subtle white glows on hover
- **Spacing**: Consistent 8px grid system
- **Transitions**: Smooth 0.2s animations

## 🚀 Performance Features

- **Optimized Rendering**: React.memo for performance
- **Lazy Loading**: Images and heavy components
- **Efficient State Management**: Minimal re-renders
- **Responsive Images**: Optimized for different screen sizes

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablets
- **Desktop Enhancement**: Full feature set on larger screens
- **Touch Friendly**: Large touch targets for mobile

## 🔮 Future Enhancements

- Real-time stock price updates
- Advanced charting with multiple timeframes
- Portfolio comparison tools
- Social sharing features
- Dark/light theme toggle
- Advanced filtering and sorting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 