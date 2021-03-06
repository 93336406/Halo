/**
 * 来源
 * https://github.com/ant-design/ant-design-pro/blob/master/src/components/SiderMenu/SiderMenu.js
 */
import React, {PureComponent} from 'react';
import cx from 'classnames';
import {Menu, Layout, Switch, Drawer} from 'antd';
import {Link} from 'dva/router';
import pathToRegexp from 'path-to-regexp';
import Icon from '../Icon';
import intl from 'react-intl-universal';
import './style/index.less';
import logo from 'assets/images/logo.png';
import logo_short from 'assets/images/logo_short.png';

const {Sider} = Layout;
const SubMenu = Menu.SubMenu;

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,
const getIcon = icon => {
    if (typeof icon === 'string' && icon.indexOf('http') === 0) {
        return <img src={icon} alt="icon" className={`sider-menu-item-img`}/>;
    }
    if (typeof icon === 'string') {
        return <Icon type={icon} antd/>;
    }
    return icon;
};

export const getMeunMatchKeys = (flatMenu, path) => {
    return flatMenu.filter(item => {
        return pathToRegexp(item.path).test(path);
    });
};

class LeftSideBar extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            openKeys: props.currentMenu ? props.currentMenu.parentPath : []
        };
    }

    componentWillReceiveProps(nextProps) {
        if ('currentMenu' in nextProps) {
            this.setState({
                openKeys: nextProps.currentMenu.parentPath || []
            });
        }
    }

    /**
     * 判断是否是http链接.返回 Link 或 a
     * Judge whether it is http link.return a or Link
     * @memberof SiderMenu
     */
    getMenuItemPath = item => {
        const itemPath = this.conversionPath(item.path);
        const icon = getIcon(item.icon);
        const {target, key} = item;
        // Is it a http link
        if (/^https?:\/\//.test(itemPath)) {
            return (
                <a href={itemPath} target={target}>
                    {icon}
                    <span>{intl.get(key)}</span>
                </a>
            );
        }
        return (
            <Link
                to={itemPath}
                target={target}
                replace={itemPath === this.props.location.pathname}
            >
                {icon}
                <span>{intl.get(key)}</span>
            </Link>
        );
    };

    /**
     * get SubMenu or Item
     */
    getSubMenuOrItem = item => {
        if (item.children && item.children.some(child => child.name)) {
            const childrenItems = this.getNavMenuItems(item.children);
            if (childrenItems && childrenItems.length > 0) {
                return (
                    <SubMenu
                        title={
                            item.icon ? (
                                <span>
                  {getIcon(item.icon)}
                                    <span>{intl.get(item.key)}</span>
                </span>
                            ) : (
                                intl.get(item.key)
                            )
                        }
                        key={item.path}
                    >
                        {childrenItems}
                    </SubMenu>
                );
            }
            return null;
        } else {
            return (
                <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>
            );
        }
    };
    /**
     * 获得菜单子节点
     */
    getNavMenuItems = menusData => {
        if (!menusData) {
            return [];
        }
        return menusData
            .filter(item => item.name && !item.hideInMenu)
            .map(item => {
                const ItemDom = this.getSubMenuOrItem(item);
                return ItemDom;
            })
            .filter(item => item);
    };

    // conversion Path
    // 转化路径
    conversionPath = path => {
        if (path && path.indexOf('http') === 0) {
            return path;
        } else {
            return `/${path || ''}`.replace(/\/+/g, '/').replace(/\/:\w+\??/, '');
        }
    };

    // Get the currently selected menu
    getSelectedMenuKeys = () => {
        const pathname = this.props.location.pathname;
        const selectMenu = getMeunMatchKeys(this.props.flatMenu, pathname)[0];
        return selectMenu ? [selectMenu.path] : [];
    };

    isMainMenu = key => {
        return this.props.menu.some(
            item => key && (item.key === key || item.path === key)
        );
    };

    handleOpenChange = openKeys => {
        const lastOpenKey = openKeys[openKeys.length - 1];
        const moreThanOne =
            openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
        this.setState({
            openKeys: moreThanOne ? [lastOpenKey] : [...openKeys]
        });
    };

    render() {
        const {
            theme,
            collapsed,
            onCollapse,
            onCollapseAll,
            leftCollapsedWidth,
            menu,
            isMobile
        } = this.props;
        const classNames = cx('sidebar-left', 'sidebar-default', {
            'sidebar-left-sm': collapsed,
            'sidebar-left-close': leftCollapsedWidth === 0,
            [theme]: !!theme
        });

        const {openKeys} = this.state;
        // if pathname can't match, use the nearest parent's key
        let selectedKeys = this.getSelectedMenuKeys();
        // Don't show popup menu when it is been collapsed
        const menuProps = collapsed
            ? {
                selectedKeys
            }
            : {
                openKeys,
                selectedKeys
            };

        const siderBar = (
            <Sider
                className={classNames}
                width={230}
                collapsedWidth={leftCollapsedWidth + 0.1}
                collapsible
                collapsed={isMobile ? false : collapsed}
                onCollapse={isMobile ? null : onCollapse}
                breakpoint="lg"
                trigger={null}
            >
                <div className="sidebar-left-content">
                    <header className={cx("sidebar-header", theme)}>
                        {collapsed ? (
                            <img style={{width: "36px", height: "36px", borderRadius: "36px"}} src={logo_short}
                                 alt="logo"/>) : (<img src={logo} alt="logo"/>)}
                    </header>
                    <Menu
                        inlineCollapsed={collapsed}
                        onOpenChange={this.handleOpenChange}
                        mode="inline"
                        theme={theme}
                        {...menuProps}
                    >
                        {this.getNavMenuItems(menu)}
                    </Menu>
                    <div className="sidebar-toggle-mini">
                        {collapsed && leftCollapsedWidth !== 0 && !isMobile ? (
                            <Switch
                                checked={collapsed}
                                onChange={onCollapseAll}
                                size="small"
                            />
                        ) : null}
                    </div>
                </div>
            </Sider>
        );

        return isMobile ? (
            <Drawer
                className="left-sidebar-drawer"
                visible={!collapsed}
                placement="left"
                onClose={onCollapse}
                width={230}
            >
                {siderBar}
            </Drawer>
        ) : (
            siderBar
        );
    }
}

export default LeftSideBar;