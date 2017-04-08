import * as React from "react";

import { Panel } from "react-bootstrap";
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';

import { User, PublicUser } from "../../../common/models/User";

export interface UserScoreboardProps {
    users: PublicUser[];
    title: string;
}

export function UserScoreboard(props: UserScoreboardProps) {
    const sorted = props.users.sort((user1, user2) => {
        return user2.points - user1.points;
    });
    const items: JSX.Element[] = [];
    for (let i = 0; i < sorted.length; i++) {
        const user = sorted[i];
        items.push(<ListItem key={user.key}
            primaryText={`${i + 1}   ${user.display}`}
            leftAvatar={<Avatar src={user.imageUrl}></Avatar>}
            rightIcon={<div>{user.points}</div>}
            disabled={true}>
            </ListItem>);
        items.push(<Divider inset={true}></Divider>);
    }
    return <Panel header={props.title}>
        <List>
            {items}
        </List>
    </Panel>;
}