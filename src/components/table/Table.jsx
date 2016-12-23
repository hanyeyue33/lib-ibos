import React, {Component} from 'react'

import {Table as AntdTable, Button, Modal, Transfer } from 'antd'
import {checkSecurity} from '../share'

import CustomColumnsModal from './CustomColumnsModal'

function checkCustomColumns(props, customColumns ) {
    return customColumns.indexOf(props.dataIndex) > -1
}

class Table extends Component {

    constructor() {
        super()
        this.state = {
            visible: false
        }
    }

    handleShow = () => {
        this.setState({visible: true})
    }

    handleClose = () => {
        this.setState({visible: false})
    }

    render() {
        const {children, security, customConfig, onCustomChange, ...otherProps} = this.props
        const {canAccess} = checkSecurity(this.props)

        const columnKeys = customConfig && customConfig.columnKeys

        const isValidCustomKeys = columnKeys && Array.isArray(columnKeys) && columnKeys.length > 0

        const columnConfigs =  React.Children.map(children, child => child.props)
        
        // 缓存下，便于自定义列时快速查找
        let memo = {}

        let columns = columnConfigs
            .filter(childProps => isValidCustomKeys ? checkCustomColumns(childProps, columnKeys) : true)
            .filter(childProps => {
                const canAccess = checkSecurity(childProps).canAccess
                canAccess && (memo[childProps.dataIndex] = childProps)
                return canAccess
            })

        if (isValidCustomKeys) {
            columns = columnKeys.map(col => memo[col])
        }
        
        let title, pageSize = 10, scroll = {}

        if (customConfig) {
            title = (data) => <Button onClick={this.handleShow}>自定义列</Button>
            if (customConfig.fixCols) {
                columns = columns.map((c,i) => {
                   const fixed = i < customConfig.fixCols 
                   return {...c, fixed}
                } )
            }

            if (customConfig.pageSize) {
                pageSize = customConfig.pageSize
            }

            if (customConfig.width) {
                scroll.x = customConfig.width
            }

            if (customConfig.height) {
                scroll.y = customConfig.height
            }
        }
        
        if (canAccess) {
            const tableOpts = {
                title,
                ...otherProps,
                columns,
                pagination: {
                    pageSize,
                    showTotal: (total) =>  `共${total}条`
                },
                scroll
            }
            const modalOpts = {
                ...customConfig,
                visible: this.state.visible,
                onCancel: this.handleClose,
                onOk: onCustomChange,
                dataSource: columnConfigs.map( ({title, dataIndex}) => ({key: dataIndex, title})),
            }
            // 每次弹框都重新渲染
            const CustomColumnsModalGen = () => <CustomColumnsModal {...modalOpts} />

            console.log(tableOpts)
            return (
                <div>
                    <AntdTable {...tableOpts}  />
                    <CustomColumnsModalGen />
                </div>
            )
        }
        return <noscript/>
    }
}

export default Table