/**
 * 侧边栏主体
 * @class SidebarMain
 * @state {number} content 显示内容
 * @prop {string} menu 菜单显示方式
 * @prop {array} users 用户列表
 * @prop {array} groups 群组列表
 * @prop {object} settings 设置列表
 * @prop {function} joinGroup 加入群组
 * @prop {function} privateChat 私聊
 * @prop {function} showEditGroup 展现群组编辑框
 * @prop {function} toggleReceive 切换接收私聊
 * @prop {function} toggleSound 切换声音提示
 * @prop {function} toggleNotice 切换桌面提示
 * @prop {function} toggleScreen 切换全屏
 */


import React from 'react';
import SidebarUsers from './SidebarUsers';
import SidebarGroups from './SidebarGroups';
import SidebarSettings from './SidebarSettings';


export default class SidebarMain extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { content: 1 };
    }


    render() {
        const content = this.state.content;
        const activeStyle = { borderBottom: '2px solid #4385F5', color: '#4385F5' };
        let resStyle = {};
        if (document.body.clientWidth <= 886) {
            resStyle = { display: this.props.menu ? 'flex' : 'none' };
        }

        // 根据状态展示不同列表
        let SideBarList;
        if (content === 1) {
            SideBarList = (
                <SidebarUsers
                  users={this.props.users}
                  privateChat={this.props.privateChat}
                />
            );
        } else if (content === 2) {
            SideBarList = (
                <SidebarGroups
                  groups={this.props.groups}
                  joinGroup={this.props.joinGroup}
                  showEditGroup={this.props.showEditGroup}
                />
            );
        } else {
            SideBarList = (
                <SidebarSettings
                  settings={this.props.settings}
                  toggleReceive={this.props.toggleReceive}
                  toggleSound={this.props.toggleSound}
                  toggleNotice={this.props.toggleNotice}
                  toggleScreen={this.props.toggleScreen}
                />
            );
        }


        return (
            <div className="sidebar-main" style={resStyle}>
                <div className="sidebar-menu">
                    <button
                      onClick={() => this.setState({ content: 1 })}
                      style={ content === 1 ? activeStyle : {} }
                    >用户</button>
                    <button
                      onClick={() => this.setState({ content: 2 })}
                      style={ content === 2 ? activeStyle : {} }
                    >群组</button>
                    <button
                      onClick={() => this.setState({ content: 3 })}
                      style={ content === 3 ? activeStyle : {} }
                    >设置</button>
                </div>
                <div className="sidebar-content">
                    {SideBarList}
                </div>
            </div>
        );
    }
}
