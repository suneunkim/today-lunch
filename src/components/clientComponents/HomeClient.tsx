'use client'

import { useCallback, useState } from 'react'
import MenuSelection from '../MenuSelection'

const HomeClient = () => {
  const [selectedMenu, setSelectedMenu] = useState('전체')

  const handleClick = useCallback((menu: string) => {
    setSelectedMenu(menu)
  }, [])

  return <MenuSelection selectedMenu={selectedMenu} handleClick={handleClick} />
}

export default HomeClient
