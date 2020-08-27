import React from 'react';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';
import firebase from './firebase.js';
import md5 from 'md5';

const database = firebase.database();

class Leaderboard {
  constructor(players) {
    // Add players to sorted list
    if (players.length === 0) { this.list = []; }
    else {
      this.list = players.length > 0 ? [players[0]] : []
      for (var i = 1; i < players.length; i++) {
        this.add_player(players[i])
      }
    }
  }

  add_player(player) {
    if (this.list[0].rating < player.rating) {
      this.list.unshift(player);
    }
    else {
      var j = 1;
      while (j < this.list.length && this.list[j].rating > player.rating) {
        j += 1;
      }
      this.list.splice(j, 0, player);
    }
  }

  update_rating(name, change) {
    var i = 0;
    while (i < this.list.length && this.list[i].name !== name) {
      i += 1;
    }
    if (i === this.list.length) throw "Name not found";
    const player = this.list[i];
    this.list.splice(i, 1);
    player.rating += change;
    this.add_player(player);
  }

}

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
  const list = props.players.map((player, rank) =>
    <li key={player.username}>{player.name}, MMR: {player.rating}, Games played: {player.games_played}</li>
  );
  return <ol>{list}</ol>
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
    for (var i = 0; i < props.players.length; i++) {
      if (props.players[i].username === taken) continue;
      list.push(<MenuItem value={props.players[i].username}>{props.players[i].name}</MenuItem>)
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
    database.ref('history').limitToLast(5).once('value', data => {
      console.log('here')
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
  const views = [<LeaderboardView players={props.leaderboard.list} />,
  <ReportView players={props.leaderboard.list} submit={props.submit} />,
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
      players: [],
      leaderboard: new Leaderboard([]),
      user: null,
    };
  }

  componentDidMount() {
    database.ref('users').orderByChild('rating').on('value', data => {
      this.setState(() => {
        const players = [];
        data.forEach(user => {
          const player = user.toJSON();
          player['username'] = user.key;
          players.push(player);
        });
        const leaderboard = new Leaderboard(players);
        return { players, leaderboard };
      })
    });
  }

  login(user, pass) {
    let i = 0;
    while (i < this.state.players.length && this.state.players[i].username !== user) {
      i += 1;
    }
    if (i === this.state.players.length) {
      alert("Username is incorrect");
      return;
    }
    else if (md5(pass) !== this.state.players[i].password) {
      alert("Password is incorrect");
      return;
    }
    this.setState({ current_view: 0, user: user });
  }

  change_current_view(val) {
    this.setState({ current_view: val });
  }

  add_game(winner, loser) {
    if (this.state.user === null) {
      alert("You need to be logged in");
      return;
    }
    database.ref('users').once('value').then(data => {
      if (data.hasChild(winner) && data.hasChild(loser)) {
        const mmrW = data.child(winner + '/rating').val();
        const mmrL = data.child(loser + '/rating').val();
        const gamesW = data.child(winner + '/games_played').val();
        const gamesL = data.child(loser + '/games_played').val();
        const nameW = data.child(winner + '/name').val();
        const nameL = data.child(loser + '/name').val();
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

        console.log('mmrW: ' + mmrW.toString());
        console.log(historyKey);

        const updates = {};
        updates['/history/' + historyKey] = newHistory;
        updates['users/' + winner + '/rating'] = mmrW + change;
        updates['users/' + loser + '/rating'] = mmrL - change;
        updates['users/' + winner + '/games_played'] = gamesW + 1;
        updates['users/' + loser + '/games_played'] = gamesL + 1;
        database.ref().update(updates);
      }
    });
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