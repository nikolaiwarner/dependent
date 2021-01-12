import React, { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import store from 'store'

import './App.css'

interface ItemProps {
  id: string
  name: string
  dependencies: string[]
}

function App() {
  const [items, setItems] = useState<ItemProps[]>(store.get('items') ?? [])
  const [selectedItemId, setSelectedItemId] = useState<string>()

  // const exists = useCallback(
  //   (name: string) => {
  //     return items.find((item: ItemProps) => {
  //       return item.name.toLowerCase() === name.toLowerCase()
  //     })
  //   },
  //   [items],
  // )

  // function parents(item: ItemProps): ItemProps[] {
  //   return items.filter((parentItem: ItemProps) => {
  //     return dependsOn(parentItem, item)
  //   })
  // }

  // function dependsOn(item1: ItemProps, item2: ItemProps): boolean {
  //   return item1.dependencies.includes(item2.id)
  // }

  const updateItem = useCallback(
    (id: string, properties: any) => {
      const newItems = items.map((item: ItemProps) => {
        if (item.id === id) {
          return { ...item, ...properties }
        } else {
          return item
        }
      })
      setItems(newItems)
    },
    [items],
  )

  const addDependency = useCallback(
    (parent: ItemProps, child: ItemProps) => {
      if (parent.id !== child.id) return
      updateItem(parent.id, { dependencies: [...parent!.dependencies, child.id] })
    },
    [updateItem],
  )

  function removeDependency(parent: ItemProps, child: ItemProps) {
    const newItems = items.filter((item: ItemProps) => {
      const index = item.dependencies.indexOf(child.id)
      const dependencies = item.dependencies.splice(index, 1)
      if (item.id === parent.id) {
        return { ...item, dependencies }
      } else {
        return item
      }
    })
    setItems(newItems)
  }

  const removeItem = useCallback(
    (removedItem: ItemProps) => {
      const newItems = items.filter((item: ItemProps) => item.id !== removedItem.id)
      setItems(newItems)
    },
    [items],
  )

  const addItem = useCallback(
    (item: ItemProps) => {
      const newItems = [...items]
      newItems.push(item)
      setItems(newItems)
    },
    [items],
  )

  const getItem = useCallback(
    ({ id, name }: { id?: string; name?: string }) => {
      return items.find((item: ItemProps) => {
        return item.id === id || item.name === name?.toLowerCase()
      })
    },
    [items],
  )

  const onClickAddNewItem = useCallback(
    (event: any) => {
      const newItemInput = document.getElementById('addInput') as HTMLInputElement
      const name = newItemInput.value
      const selectedItem = getItem({ id: selectedItemId })
      const existingItem = getItem({ name })
      if (existingItem) {
        if (selectedItem) {
          addDependency(selectedItem, existingItem)
        }
      } else {
        const newItem: ItemProps = {
          dependencies: [],
          id: uuidv4(),
          name,
        }
        if (selectedItem) {
          addDependency(selectedItem, newItem)
        }
        addItem(newItem)
        newItemInput.value = ''
        newItemInput.focus()
      }
    },
    [addDependency, addItem, getItem, selectedItemId],
  )

  const onEnterKeyPress = useCallback(
    (event: any) => {
      if (event.keyCode === 13) {
        onClickAddNewItem(event)
      }
    },
    [onClickAddNewItem],
  )

  useEffect(() => {
    const input = document.getElementById('addInput')
    input?.addEventListener('keyup', onEnterKeyPress)
    return () => {
      input?.removeEventListener('keyup', onEnterKeyPress)
    }
  }, [onEnterKeyPress])

  useEffect(() => {
    store.set('items', items)
  }, [items])

  function onClickSelectItem(item: ItemProps) {
    if (item.id === selectedItemId) {
      setSelectedItemId('')
    } else {
      setSelectedItemId(item.id)
    }
  }

  function reset() {
    setItems([])
  }

  function renderItem(item: ItemProps, parentItem?: ItemProps) {
    // const hasParentsNoChildren = !!parents(item).length && !item.dependencies.length
    // style={{ color: hasParentsNoChildren ? '#aaa' : '#000' }}

    function onClickEdit() {
      const name = prompt('rename')
      updateItem(item.id, { name })
    }

    function onClickDelete() {
      if (parentItem) {
        removeDependency(parentItem, item)
      } else {
        removeItem(item)
      }
    }

    return (
      <li key={item.id}>
        <input
          onClick={() => onClickSelectItem(item)}
          checked={selectedItemId === item.id}
          type="checkbox"
        />
        <span>
          {item.name}
          <button onClick={onClickEdit}>✎</button>
          <button onClick={onClickDelete}>Ｘ</button>
        </span>
        <ul>
          {item.dependencies.map((depId) => {
            const depItem = getItem({ id: depId })
            return depItem ? renderItem(depItem, item) : null
          })}
        </ul>
      </li>
    )
  }

  return (
    <div className="App">
      <input id="addInput"></input>
      <button onClick={onClickAddNewItem}>add</button>
      <button onClick={() => reset()}>reset</button>
      <hr />
      <ul>{items.map((item) => renderItem(item))}</ul>
    </div>
  )
}

export default App
