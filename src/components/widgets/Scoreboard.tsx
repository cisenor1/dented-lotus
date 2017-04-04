import * as React from "react";
import { Button, Glyphicon, Panel, Table } from "react-bootstrap";
import { DriverModel } from "../../../common/models/Driver";
import { User, PublicUser } from "../../../common/models/User";
import { StateManager } from "../../StateManager";
import * as UUID from "uuid/v1";
export class ScoreboardType {
    static DRIVERS = "drivers";
    static USERS = "users";
    static TEAMS = "teams";
}

export interface ScoreboardProps {
    count: number;
    /**Scoreboard Type: Drivers or Users */
    type: string;
    publicUsers: PublicUser[];
    user: User;
    drivers: DriverModel[];
    title: string;
}

export interface CanShowOnScoreboard {
    points: number;
    display: string;
    key: string;
    position: number;
}

export interface ScoreboardState {
    entrants: CanShowOnScoreboard[];
}


export class Scoreboard extends React.Component<ScoreboardProps, any>{

    /**
     *
     */
    constructor(props: ScoreboardProps) {
        super(props);
        let entrants;
        switch (props.type) {
            case ScoreboardType.DRIVERS:
                entrants = props.drivers;
                break;
            case ScoreboardType.USERS:
                entrants = props.publicUsers;
                break;
        }

        entrants.forEach((e, i) => {
            e.key = e.key ? e.ekey : UUID();
            e.position = i + 1;
        });

        this.state = {
            entrants: entrants.slice(0, this.props.count)
        }
    }

    componentWillReceiveProps(newProps: ScoreboardProps) {
        let entrants: CanShowOnScoreboard[];
        switch (newProps.type) {
            case ScoreboardType.DRIVERS:
                entrants = newProps.drivers.slice(0, newProps.count).map((driver: DriverModel, index: number) => {
                    const entrant: CanShowOnScoreboard = {
                        key: driver.key,
                        display: driver.name,
                        points: driver.points,
                        position: index + 1
                    };
                    return entrant;
                });
                break;
            case ScoreboardType.USERS:
                entrants = newProps.publicUsers.sort((publicUser1, publicUser2) => {
                    return publicUser2.points - publicUser1.points;
                }).slice(0, newProps.count).map((publicUser: PublicUser, index: number) => {
                    const entrant: CanShowOnScoreboard = {
                        key: UUID(),
                        display: publicUser.display,
                        points: publicUser.points,
                        position: index + 1
                    };
                    return entrant;
                });
                break;
        }

        this.setState({ entrants: entrants });
    }

    render() {
        return <Panel header={this.props.title}>
            <Table striped bordered condensed responsive>
                <thead>
                    <tr>
                        <th>#</th><th>Name</th><th className="center-text">Points</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.entrants.map((e, i) => { return <tr key={e.key}><td>{e.position}</td><td>{e.display}</td><td className="center-text">{e.points}</td></tr> })}
                </tbody>
            </Table>
        </Panel>
    }
}