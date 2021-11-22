import logo from './logo.svg';
import './App.css';
import SearchForm from './common/SearchForm';

function App() {

  function popup(term) {
    window.alert(`You searched for "${term}"`)
  }

  return (
    <div className="App">
      <header className="App-header">
        <SearchForm searchWith={popup} />

      </header>
    </div>
  );
}

export default App;
