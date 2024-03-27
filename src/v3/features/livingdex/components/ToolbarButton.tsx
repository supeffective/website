import Link from 'next/link'
import React, { useState } from 'react'

import { classNameIf, classNames } from '@/v3/lib/utils/deprecated'

import styles from './ToolbarButton.module.css'

export type ToolbarButtonStatus = null | 'selected' | 'loading' | 'success' | 'error' | 'disabled' | 'hidden'

export interface ToolbarButtonProps {
  actionName: string | null
  href?: string
  target?: string
  rel?: string
  className?: string
  onClick?: (actionName: string | null) => void
  status?: ToolbarButtonStatus | string
  icon?: string | React.ReactNode
  label?: string
  showLabel?: boolean
  children?: React.ReactNode

  // [key: string]: any
}

export const ToolbarButton = (props: ToolbarButtonProps) => {
  const { actionName, href, target, rel, className, onClick, status, icon, label, showLabel, children, ...rest } = props

  const hasHref = props.href !== undefined

  const classes = classNames(
    styles.btn,
    classNameIf(status === 'selected' && !hasHref, styles.selected),
    classNameIf(status === 'loading', styles.loading),
    classNameIf(status === 'success', styles.success),
    classNameIf(status === 'error', styles.error),
    classNameIf(status === 'disabled', styles.disabled),
    classNameIf(status === 'hidden', styles.hidden),
    classNameIf(showLabel, styles.withLabel),
    classNameIf(icon === undefined, styles.noIcon),
    className,
  )

  const handleClick = () => {
    if (onClick) {
      onClick(actionName)
    }
  }

  const iconElement = (
    <>
      {icon && typeof icon === 'string' && <i className={'icon-' + icon} />}
      {icon && typeof icon !== 'string' && icon}
    </>
  )

  if (props.href) {
    return (
      <Link
        href={props.href}
        className={classes}
        onClick={handleClick}
        title={!showLabel ? label : undefined}
        target={props.target}
        {...rest}
      >
        {iconElement}
        {label && showLabel && <span className={styles.label}>{label}</span>}
        {children}
      </Link>
    )
  }

  return (
    <span className={classes} onClick={handleClick} title={!showLabel ? label : undefined} {...rest}>
      {iconElement}
      {label && showLabel && <span className={styles.label}>{label}</span>}
      {children}
    </span>
  )
}

export type ToolbarButtonGroupChildProps = Omit<ToolbarButtonProps, 'onClick'>

export interface ToolbarButtonGroupProps {
  initialAction: string | null
  isDeselectable?: boolean
  isDropdown?: boolean
  isMultiple?: boolean
  dropdownPosition?: 'left' | 'right' | 'middle'
  dropdownTitle?: string
  className?: string
  dropdownNoActionIcon?: string | React.ReactNode
  onButtonClick?: (newAction: string | null, prevState: ToolbarButtonStatus, prevAction: string | null) => void
  items: (ToolbarButtonGroupChildProps | null)[]
  children?: React.ReactNode
  label?: string
  //[key: string]: any
}

export const ToolbarButtonGroup = (props: ToolbarButtonGroupProps) => {
  const {
    initialAction,
    isDeselectable,
    className,
    onButtonClick,
    isMultiple,
    isDropdown,
    dropdownTitle,
    dropdownPosition,
    dropdownNoActionIcon,
    items,
  } = props
  const [selectedAction, setSelectedAction] = useState(initialAction)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  let selectedActionIcon: string | null = null

  const handleFocus = (e: FocusEvent | any) => {
    setDropdownOpen(true)
    e.stopPropagation()
  }
  const handleBlur = (e: FocusEvent | any) => {
    setDropdownOpen(false)
    e.stopPropagation()
  }
  const handleDropdownClick = (e: MouseEvent | any) => {
    if (!dropdownOpen) {
      setDropdownOpen(true)
    }
    e.stopPropagation()
  }

  const handleClick = (child: ToolbarButtonGroupChildProps) => {
    if (child.href) {
      return
    }

    if (child.status === 'disabled') {
      return
    }
    let actualAction: string | null = child.actionName

    if (isDeselectable === true && selectedAction === child.actionName) {
      actualAction = null
      setSelectedAction(null)
    } else if (selectedAction !== child.actionName) {
      setSelectedAction(child.actionName)
    }

    if (isDropdown) {
      setDropdownOpen(false)
    }

    if (onButtonClick) {
      onButtonClick(actualAction, child.status as any, selectedAction)
    }
  }

  const handleUnselectClick = () => {
    setSelectedAction(null)
    if (isDropdown) {
      setDropdownOpen(false)
    }
    if (onButtonClick) {
      onButtonClick(null, null, selectedAction)
    }
  }

  const classes = classNames(
    styles.btnGroup,
    classNameIf(isDropdown, styles.dropdown),
    classNameIf(isDropdown && dropdownOpen, styles.dropdownOpen),
    classNameIf(dropdownPosition === 'left', styles.dropdownLeft),
    classNameIf(dropdownPosition === 'right', styles.dropdownRight),
    classNameIf(dropdownPosition === 'middle', styles.dropdownMiddle),
    className,
  )

  const childrenElements: React.ReactNode[] = items.map((child, index) => {
    if (child === null) {
      return <div key={`action-${index}`} className={classNames(styles.btnSeparator)} />
    }
    const { actionName, className, icon, label, showLabel } = child

    const status = child.status === undefined ? (child.actionName === selectedAction ? 'selected' : null) : child.status

    if (icon && child.actionName === selectedAction && status === 'selected') {
      selectedActionIcon = icon as any
    }

    return (
      <ToolbarButton
        key={actionName}
        {...child}
        actionName={actionName}
        className={className}
        onClick={() => handleClick({ ...child, status })}
        status={status}
        icon={icon}
        label={label}
        href={child.href}
        target={child.target}
        rel={child.rel}
        showLabel={showLabel !== undefined ? showLabel : isDropdown === true}
      />
    )
  })

  if (isDeselectable) {
    childrenElements.unshift(
      <ToolbarButton
        key={'unselect'}
        actionName={null}
        onClick={handleUnselectClick}
        icon={undefined}
        label={`---`}
        status={null}
        showLabel={true}
      />,
    )
  }

  if (isDropdown && dropdownTitle) {
    childrenElements.unshift(
      <div key={'dd-title'} className={styles.dropdownTitle}>
        {dropdownTitle}
      </div>,
    )
  }

  if (props.children) {
    childrenElements.push(
      <div key={`dd-extra`} className={classNames(styles.extraChildren)}>
        {props.children}
      </div>,
    )
  }

  const dropdownIcon = isMultiple ? dropdownNoActionIcon : selectedActionIcon || dropdownNoActionIcon

  return (
    <span className={classes} tabIndex={0} onClick={handleDropdownClick} onFocus={handleFocus} onBlur={handleBlur}>
      {isDropdown && (
        <ToolbarButton
          actionName={'open-dropdown'}
          className={styles.dropdownTrigger}
          status={selectedAction !== null && !isMultiple ? 'selected' : null}
          icon={dropdownIcon || 'square'}
          label={props.label || props.dropdownTitle}
        />
      )}
      {isDropdown && <span className={classNames(styles.dropdownOptions)}>{childrenElements}</span>}
      {!isDropdown && childrenElements}
    </span>
  )
}

export const ToolbarButtonGroupGroup = ({
  children,
  collapsed,
  position,
  className,
}: {
  children: React.ReactNode
  collapsed?: boolean
  position?: 'left' | 'right'
  className?: string
}) => {
  return (
    <div
      className={classNames(
        styles.btnGroupGroup,
        classNameIf(collapsed, styles.btnGroupGroupCollapsed),
        classNameIf(position === 'right', styles.btnGroupGroupRight),
        className,
      )}
    >
      {children}
    </div>
  )
}
