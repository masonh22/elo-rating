import React from 'react';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DataTable from 'react-data-table-component';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';
import firebase from './firebase.js';
import md5 from 'md5';

const database = firebase.database();


const BottomNav = props => {
  const value = props.value;

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue) => {
        props.update(newValue);
      }}
      showLabels
      className="bottom-nav"
    >
      <BottomNavigationAction label="Leaderboard" />
      <BottomNavigationAction label="Report Game" />
      <BottomNavigationAction label="History" />
      <BottomNavigationAction label={props.login ? "Log in" : "Profile"} />
    </BottomNavigation>
  )
}

const LeaderboardView = props => {
  const columns = [
    {
      name: 'MMR',
      selector: 'rating',
      sortable: true,
      width: '33.3vw',
    },
    {
      name: 'Name',
      selector: 'name',
      sortable: false,
      width: '33.3vw',
    },
    {
      name: 'Games Played',
      selector: 'games_played',
      sortable: true,
      center: true,
      width: '33.3vw',
    },
  ]
  const customStyles = {
    rows: {
      style: { fontSize: '16px' }
    },
    headCells: {
      style: { fontSize: '16px' }
    }
  };
  return (<DataTable
    columns={columns}
    data={props.leaderboard}
    customStyles={customStyles}
    defaultSortField='rating'
    dense
    defaultSortAsc={false} />);
}

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const ReportView = props => {
  const classes = useStyles();
  const [winner, setWinner] = React.useState('');
  const [loser, setLoser] = React.useState('');

  const makeList = (taken) => {
    const list = [];
    const l2 = props.players.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    for (var i = 0; i < l2.length; i++) {
      if (l2[i].username === taken) continue;
      list.push(<MenuItem value={l2[i].username}>{l2[i].name}</MenuItem>)
    }
    return list;
  };

  return (
    <div className="selectors">
      <FormControl className={classes.formControl}>
        <InputLabel id="winner-select-label">Winner</InputLabel>
        <Select
          labelId="winner-select-label"
          id="winner-select"
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          className="select"
        >
          {makeList(loser)}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel id="loser-select-label">Loser</InputLabel>
        <Select
          labelId="loser-select-label"
          id="loser-select"
          value={loser}
          onChange={(e) => setLoser(e.target.value)}
          className="select"
        >
          {makeList(winner)}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={() => props.submit(winner, loser)}
      >
        Submit
      </Button>
    </div>
  )
}

const History = props => {
  const columns = [
    {
      name: 'Date',
      selector: 'date',
      sortable: true,
      width: '25vw',
    },
    {
      name: 'Winner',
      selector: 'winner',
      sortable: true,
      width: '25vw',
    },
    {
      name: 'Loser',
      selector: 'loser',
      sortable: true,
      width: '25vw',
    },
    {
      name: 'MMR Change',
      selector: 'mmr_change',
      sortable: true,
      center: true,
      width: '25vw',
    },
  ]
  const customStyles = {
    rows: {
      style: { fontSize: '18px' }
    },
    headCells: {
      style: { fontSize: '16px' }
    }
  };
  return (<DataTable
    columns={columns}
    data={props.history}
    customStyles={customStyles}
    defaultSortField='date'
    defaultSortAsc={false}
    dense
    pagination
    paginationRowsPerPageOptions={[10, 50]}
    paginationComponentOptions={{ rowsPerPageText: 'Rows per page:', rangeSeparatorText: 'of', noRowsPerPage: true, selectAllRowsItem: false, selectAllRowsItemText: 'All' }} />);
}

const Login = props => {
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');

  return (
    <div className="selectors">
      <TextField
        id="username-input"
        label="Username"
        type="search"
        onChange={(v) => setUser(v.target.value)} />
      <TextField
        id="password-input"
        label="Password"
        type="password"
        onChange={(v) => setPass(v.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => props.submit(user.toLowerCase(), pass)}
      >
        Submit
      </Button>
    </div>);
}

const UpdatePass = props => {
  const [oldpass, setOldpass] = React.useState('');
  const [newpass, setNewpass] = React.useState('');

  return (
    <div className="selectors-2">
      <TextField
        id="oldpass-input"
        label="Old Password"
        type="password"
        onChange={(v) => setOldpass(v.target.value)} />
      <TextField
        id="password-input"
        label="New Password"
        type="password"
        onChange={(v) => setNewpass(v.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => props.update(oldpass, newpass)}
      >
        Submit
      </Button>
    </div>);
}

const Profile = props => {
  const history = props.history.filter(event =>
    event.winner === props.user.name || event.loser === props.user.name);
  const message =
    `Current MMR: ${props.user.rating}. Games Played: ${props.user.games_played}`;

  return (<div>
    <h2>{props.user.name}</h2>
    <p>{message}</p>
    <History history={history} />
    <UpdatePass update={props.updatepass} />
  </div>);
}

const Content = props => {
  const views = [<LeaderboardView leaderboard={props.leaderboard} />,
  <ReportView players={props.leaderboard} submit={props.submit} />,
  <History history={props.history} />,
  props.login ? <Login submit={props.loginfunc} />
    : <Profile history={props.history}
      user={props.user}
      updatepass={props.updatepass} />];
  return views[props.view];
}

const win_probability = (mmrW, mmrL) => {
  return (1 / (1 + Math.pow(10, (mmrW - mmrL) / 400)));
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      current_view: 0,
      players: {},
      leaderboard: [],
      history: [],
      user: null,
    };
  }

  componentDidMount() {
    database.ref('users').orderByChild('rating').on('value', data => {
      this.setState(() => {
        const json = data.toJSON();
        const leaderboard = Object.keys(json).map(user => {
          const player = json[user]
          player['username'] = user;
          return player;
        });
        return { players: data.val(), leaderboard };
      });
    });
    database.ref('history').on('value', data => {
      this.setState(() => {
        const json = data.toJSON();
        const history = Object.keys(json).map(key => json[key]);
        return { history: history.reverse() };
      });
    });
  }

  change_current_view(val) {
    this.setState({ current_view: val });
  }

  login(user, pass) {
    if (!this.state.players[user]) {
      alert("Username is incorrect");
      return;
    }
    database.ref('passwords').once('value').then(data => {
      if (md5(pass) !== data.val()[user]) {
        alert("Password is incorrect");
        return;
      }
      this.setState(state => ({
        user: Object.assign({ username: user }, state.players[user])
      }));
    });
  }

  update_password(old, newpass) {
    database.ref('passwords').once('value').then(data => {
      if (md5(old) !== data.val()[this.state.user.username]) {
        alert("Password is incorrect");
      }
      const newobj = {};
      newobj[this.state.user.username] = md5(newpass);
      database.ref('passwords').update(newobj);
      alert("Password changed");
    });
  }

  add_game(winner, loser) {
    if (this.state.user === null) {
      alert("You need to be logged in");
      return;
    }
    if (this.state.players[winner] && this.state.players[loser]) {
      const mmrW = this.state.players[winner].rating;
      const mmrL = this.state.players[loser].rating;
      const gamesW = this.state.players[winner].games_played;
      const gamesL = this.state.players[loser].games_played;
      const nameW = this.state.players[winner].name;
      const nameL = this.state.players[loser].name;
      const win_prob = win_probability(mmrW, mmrL);
      const change = Math.round(win_prob * 50);

      const d = new Date();

      const historyKey = database.ref('history').push().key;
      const newHistory = {
        winner: nameW,
        loser: nameL,
        posted_by: this.state.user,
        mmr_change: change,
        date: (d.getMonth() + 1).toString() + '/' + d.getDate().toString(),
      }

      const updates = {};
      updates['/history/' + historyKey] = newHistory;
      updates['users/' + winner + '/rating'] = mmrW + change;
      updates['users/' + loser + '/rating'] = mmrL - change;
      updates['users/' + winner + '/games_played'] = gamesW + 1;
      updates['users/' + loser + '/games_played'] = gamesL + 1;
      database.ref().update(updates);
    }
    this.change_current_view(0);
  }

  render() {
    return (
      <div className="App">
        <div className="content-container">
          <Content
            leaderboard={this.state.leaderboard}
            history={this.state.history}
            view={this.state.current_view}
            submit={(winner, loser) => this.add_game(winner, loser)}
            login={this.state.user === null}
            loginfunc={(user, pass) => this.login(user, pass)}
            user={this.state.user}
            updatepass={(p1, p2) => this.update_password(p1, p2)} />
        </div>
        <footer className="footer">
          <BottomNav
            value={this.state.current_view}
            update={(v) => this.change_current_view(v)}
            login={this.state.user === null} />
        </footer>
      </div>
    );
  }
}

export default App;