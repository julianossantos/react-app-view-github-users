import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List, Error } from './styles';

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newRepo: '',
      repositories: [],
      loading: false,
      error: null,
      message: null,
    };
  }

  // Carregar os dados do localStorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  // Slavar os dados do localStorage
  componentDidUpdate(_, prevState) {
    if (prevState !== this.repositories) {
      const { repositories } = this.state;

      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    // this.setState({ newRepo: e.target.value });
    this.setState({ newRepo: e.target.value, error: null, message: null });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true, error: false });

    try {
      const { newRepo, repositories } = this.state;

      const hasRepo = repositories.find(r => r.full_name === newRepo);

      if (newRepo === '') throw 'Você precisa indicar um repositório'();

      if (hasRepo) throw 'Repositório duplicado'();
      const hasRepo2 = repositories.find(r => r.name === newRepo);

      if (hasRepo2) throw new 'Repositório duplicado'();

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };
      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
      });
    } catch (err) {
      this.setState({ message: err.message });
      this.setState({ error: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { newRepo, repositories, loading, error, message } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositorios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder="Adicionar repositórios"
            value={newRepo}
            onChange={this.handleInputChange}
          />
          <SubmitButton loading={loading} error={error}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        {message && <Error>{message}</Error>}

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
