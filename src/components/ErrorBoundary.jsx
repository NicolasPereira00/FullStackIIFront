import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props){ super(props); this.state = { hasError:false, error:null, info:null }; }
  static getDerivedStateFromError(error){ return { hasError:true, error }; }
  componentDidCatch(error, info){ console.error('[Boundary]', error, info); this.setState({ info }); }
  render(){
    if (this.state.hasError) {
      return (
        <div style={{padding:16}}>
          <h3>Ops! Algo quebrou nesta página.</h3>
          <pre style={{whiteSpace:'pre-wrap', background:'#f8f8f8', padding:8, borderRadius:8}}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
