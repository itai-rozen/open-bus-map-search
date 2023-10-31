import React, { useCallback, useEffect } from 'react'
import 'antd/dist/antd.min.css'
import './App.scss'
import TimelinePage from 'src/pages/TimelinePage'

import 'leaflet/dist/leaflet.css'
import { TEXT_KEYS } from 'src/resources/texts'
import styled from 'styled-components'
import heIL from 'antd/es/locale/he_IL'
import { BrowserRouter as Router, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import GapsPage from './pages/GapsPage'
import { PageSearchState, SearchContext } from './model/pageState'
import moment from 'moment'
import DashboardPage from './pages/dashboard/DashboardPage'
import { useSessionStorage } from 'usehooks-ts'
import SideBar from './pages/components/header/sidebar/SideBar'
import RealtimeMapPage from './pages/RealtimeMapPage'
import SingleLineMapPage from './pages/SingleLineMapPage'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import rtlPlugin from 'stylis-plugin-rtl'
import 'moment/locale/he'
import { heIL as heILmui } from '@mui/x-date-pickers/locales'
import { ThemeProvider, createTheme } from '@mui/material'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers'
import About from './pages/About'
import GapsPatternsPage from './pages/GapsPatternsPage'
import {
  RadarChartOutlined,
  BellOutlined,
  DollarOutlined,
  HeatMapOutlined,
  LaptopOutlined,
  FieldTimeOutlined,
  BugOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { MenuPage } from './pages/components/header/menu/Menu'

import { Layout, Typography, ConfigProvider } from 'antd'

const { Content, Header } = Layout
const { Title } = Typography

const StyledLayout = styled(Layout)`
  height: 100vh;
`
const StyledContent = styled(Content)`
  margin: 24px 16px 0;
  overflow: auto;
`

const StyledBody = styled.div`
  padding: 24px;
  min-height: 360px;
`

const PAGES = [
  {
    label: TEXT_KEYS.dashboard_page_title,
    key: '/dashboard',
    icon: LaptopOutlined,
  },
  {
    label: TEXT_KEYS.timeline_page_title,
    key: '/timeline',
    searchParamsRequired: true,
    icon: FieldTimeOutlined,
  },
  {
    label: TEXT_KEYS.gaps_page_title,
    key: '/gaps',
    searchParamsRequired: true,
    icon: BarChartOutlined,
  },
  {
    label: TEXT_KEYS.gaps_patterns_page_title,
    key: '/gaps_patterns',
    icon: LineChartOutlined,
  },
  {
    label: TEXT_KEYS.realtime_map_page_title,
    key: '/map',
    icon: HeatMapOutlined,
  },
  {
    label: TEXT_KEYS.singleline_map_page_title,
    key: '/single-line-map',
    searchParamsRequired: true,
    icon: RadarChartOutlined,
  },
  {
    label: TEXT_KEYS.about_title,
    key: '/about',
    icon: BellOutlined,
  },
  {
    label: TEXT_KEYS.report_a_bug_title,
    key: 'https://github.com/hasadna/open-bus-map-search/issues',
    icon: BugOutlined,
  },
  {
    label: TEXT_KEYS.donate_title,
    key: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
    icon: DollarOutlined,
  },
] as MenuPage[]

const theme = createTheme(
  {
    direction: 'rtl',
    palette: {
      primary: {
        main: '#5f5bff',
      },
    },
  },
  heILmui,
)

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
})

const App = () => {
  const location = useLocation()

  const [searchParams, setSearchParams] = useSearchParams()
  const operatorId = searchParams.get('operatorId')
  const lineNumber = searchParams.get('lineNumber')
  const routeKey = searchParams.get('routeKey')
  const timestamp = searchParams.get('timestamp')

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search })
  }, [location])

  const [search, setSearch] = useSessionStorage<PageSearchState>('search', {
    timestamp: +timestamp! || moment().valueOf(),
    operatorId: operatorId || '',
    lineNumber: lineNumber || '',
    routeKey: routeKey || '',
  })

  useEffect(() => {
    const page = PAGES.find((page) => page.key === location.pathname)
    if (page?.searchParamsRequired) {
      const params = new URLSearchParams({ timestamp: search.timestamp.toString() })

      if (search.operatorId) {
        params.set('operatorId', search.operatorId)
      }
      if (search.lineNumber) {
        params.set('lineNumber', search.lineNumber)
      }
      if (search.routeKey) {
        params.set('routeKey', search.routeKey)
      }
      setSearchParams(params)
    }
  }, [search.lineNumber, search.operatorId, search.routeKey, search.timestamp, location.pathname])

  const safeSetSearch = useCallback((mutate: (prevState: PageSearchState) => PageSearchState) => {
    setSearch((current: PageSearchState) => {
      const newSearch = mutate(current)
      return newSearch
    })
  }, [])

  const RedirectToDashboard = () => <Navigate to={PAGES[0].key} replace />

  return (
    <SearchContext.Provider value={{ search, setSearch: safeSetSearch }}>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="he">
            <ConfigProvider direction="rtl" locale={heIL}>
              <StyledLayout className="main">
                <SideBar pages={PAGES} />
                <Layout>
                  <Header
                    style={{
                      padding: 0,
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#1677ff',
                    }}>
                    <Title
                      level={2}
                      style={{ margin: 0, color: '#fff', marginRight: '31px' }}
                      className="banner">
                      יחד ננצח
                    </Title>
                  </Header>
                  <StyledContent>
                    <StyledBody>
                      <Routes>
                        <Route path={PAGES[0].key} element={<DashboardPage />} />
                        <Route path={PAGES[1].key} element={<TimelinePage />} />
                        <Route path={PAGES[2].key} element={<GapsPage />} />
                        <Route path={PAGES[3].key} element={<GapsPatternsPage />} />
                        <Route path={PAGES[4].key} element={<RealtimeMapPage />} />
                        <Route path={PAGES[5].key} element={<SingleLineMapPage />} />
                        <Route path={PAGES[6].key} element={<About />} />
                        <Route path="*" element={<RedirectToDashboard />} />
                      </Routes>
                    </StyledBody>
                  </StyledContent>
                </Layout>
              </StyledLayout>
            </ConfigProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </CacheProvider>
    </SearchContext.Provider>
  )
}

const RoutedApp = () => (
  <Router>
    <App />
  </Router>
)
export default RoutedApp
