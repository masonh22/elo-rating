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
      <BottomNavigationAction label="Log in" />
    </BottomNavigation>
  )
}

const LeaderboardView = props => {
  const columns = [
    {
      name: 'MMR',
      selector: 'rating',
      sortable: true,
    },
    {
      name: 'Name',
      selector: 'name',
      sortable: true,
    },
    {
      name: 'Games Played',
      selector: 'games_played',
      sortable: true,
    },
  ]
  const customStyles = {
    rows: {
      style: { fontSize: '20px' }
    },
    headCells: {
      style: { fontSize: '20px' }
    }
  };
  return (<DataTable
    columns={columns}
    data={props.leaderboard}
    customStyles={customStyles}
    defaultSortField='rating'
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

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = { history: [] };
  }

  componentDidMount() {
    database.ref('history').limitToLast(15).once('value', data => {
      this.setState(() => {
        const history = [];
        data.forEach(event => {
          history.push(event.toJSON());
        })
        return { history: history.reverse() };
      });
    });
  }

  make_list() {
    return this.state.history.map((event, rank) =>
      <li key={event.key}>{event.date}: {event.winner} beats {event.loser}, +/- {event.mmr_change} MMR</li>
    );
  }

  render() {
    return <ul>{this.make_list()}</ul>;
  }
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
        onClick={() => props.submit(user, pass)}
      >
        Submit
      </Button>
    </div>);
}

const Content = props => {
  const views = [<LeaderboardView leaderboard={props.leaderboard} />,
  <ReportView players={props.leaderboard} submit={props.submit} />,
  <History />,
  <Login submit={props.login} />];
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
      user: null,
    };
  }

  componentDidMount() {
    database.ref('users').orderByChild('rating').on('value', data => {
      this.setState(() => {
        const leaderboard = [];
        data.forEach(user => {
          const player = user.toJSON();
          player['username'] = user.key;
          leaderboard.push(player);
        });
        return { players: data.val(), leaderboard };
      })
    });
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
      alert(`Signed in as ${user}`);
      this.setState({ current_view: 0, user: user });
    });
  }

  change_current_view(val) {
    this.setState({ current_view: val });
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
            view={this.state.current_view}
            submit={(winner, loser) => this.add_game(winner, loser)}
            login={(user, pass) => this.login(user, pass)} />
        </div>
        <div className="footer">
          <BottomNav
            value={this.state.current_view}
            update={(v) => this.change_current_view(v)} />
        </div>
      </div>
    );
  }
}

export default App;