import './styles/App.css';

// Component Imports
import Timer from "./components/Timer";
import Credits from "./components/Credits";


function App() {

    return (
        <div className="App">
            <header className="App-header">
                <Timer/>
                <Credits />
            </header>
        </div>
    );
}

export default App;
