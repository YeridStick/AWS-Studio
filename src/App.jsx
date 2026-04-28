import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './views/Home'
import Diagrams from './views/Diagrams'
import Services from './views/Services'
import InfrastructureTypes from './views/InfrastructureTypes'
import Networking from './views/Networking'
import Security from './views/Security'
import Kubernetes from './views/Kubernetes'
import Commands from './views/Commands'
import DynamoDBCommands from './views/DynamoDBCommands'
import Troubleshooting from './views/Troubleshooting'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diagrams" element={<Diagrams />} />
        <Route path="/services" element={<Services />} />
        <Route path="/infrastructure" element={<InfrastructureTypes />} />
        <Route path="/networking" element={<Networking />} />
        <Route path="/security" element={<Security />} />
        <Route path="/kubernetes" element={<Kubernetes />} />
        <Route path="/commands" element={<Commands />} />
        <Route path="/dynamodb" element={<DynamoDBCommands />} />
        <Route path="/troubleshooting" element={<Troubleshooting />} />
      </Routes>
    </Layout>
  )
}

export default App
