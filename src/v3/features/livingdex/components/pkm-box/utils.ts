import { PkFilter } from '@/v3/features/livingdex/repository/types'

/**
 * A simple debounce function that will call the callback after the delay
 * @param callback The callback to call
 * @param delay The delay in milliseconds
 * @returns A function that will call the callback after the delay
 */
export function debounceCallback(callback: Function, delay: number): Function {
  let timer: ReturnType<typeof setTimeout>
  return (filter: PkFilter) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(callback.bind(null, filter), delay)
  }
}

/**
 * Handles keydown events for elements with a tabindex,
 * allowing for arrow key navigation.
 * @param classSelector The class selector for the elements to handle
 * @param verticalOffset The offset to use when navigating vertically
 * @param horizontalOffset The offset to use when navigating horizontally
 * @param clickHandler The click handler to call when the space or enter key is pressed
 * @param e The keydown event
 * @returns false|undefined
 */
export const tabIndexKeyDownHandler = (
  classSelector: string,
  verticalOffset = 1,
  horizontalOffset = 1,
  clickHandler: () => void = () => {},
  e: any = undefined,
) => {
  const elemsWithTabindex = document.querySelectorAll(`.${classSelector}[tabindex]`)
  // sort by tabindex
  const spaceKey = 32
  const enterKey = 13
  const upKey = 38
  const downKey = 40
  const leftKey = 37
  const rightKey = 39
  const tabKey = 9
  const escKey = 27

  if (e.keyCode === spaceKey || e.keyCode === enterKey) {
    clickHandler()
    e.preventDefault()
    return false
  }

  if (e.keyCode === escKey && e.target.blur) {
    e.target.blur()
    e.preventDefault()
    return false
  }

  if (
    e.keyCode === tabKey ||
    e.keyCode === upKey ||
    e.keyCode === downKey ||
    e.keyCode === leftKey ||
    e.keyCode === rightKey
  ) {
    const currentIndex = e.target.tabIndex
    if (!currentIndex) return false
    let newIndex = -1

    if (e.keyCode === upKey) {
      newIndex = currentIndex - verticalOffset
    } else if (e.keyCode === downKey) {
      newIndex = currentIndex + verticalOffset
    } else if (e.keyCode === leftKey) {
      newIndex = currentIndex - horizontalOffset
    } else if (e.keyCode === rightKey || e.keyCode === tabKey) {
      newIndex = currentIndex + horizontalOffset
    }

    const nextElement = Array.from<HTMLElement | any>(elemsWithTabindex).find(
      (elem: HTMLElement | any) => elem?.tabIndex === newIndex,
    )

    // if focus function exists
    if (nextElement && nextElement.focus) {
      nextElement.focus()
    }
    e.preventDefault()
    return false
  }
}
