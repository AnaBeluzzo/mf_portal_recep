// Testes de arquitetura (ArchUnitTS) — Clean Architecture + Vertical Slice no micro-frontend.
// Apresentação: src/components | Acesso a dados (gateway da API): src/data
import { test } from 'node:test';
import assert from 'node:assert';
import { projectFiles } from 'archunit';

// O grafo do ArchUnitTS inclui a aresta de cada arquivo para ele mesmo; ela não é dependência real.
const semViolacoes = async (rule) => {
  const violacoes = (await rule.check()).filter((v) => !v.dependency || v.dependency.sourceLabel !== v.dependency.targetLabel);
  assert.deepStrictEqual(violacoes, []);
};

test('camada de dados (data) não depende da apresentação (components)', () =>
  semViolacoes(projectFiles().inFolder('src/data/**').shouldNot().dependOnFiles().inFolder('src/components/**')));

test('componentes (slices) são independentes entre si', () =>
  semViolacoes(projectFiles().inFolder('src/components/**').shouldNot().dependOnFiles().inFolder('src/components/**')));

test('não há dependências cíclicas', () =>
  semViolacoes(projectFiles().inFolder('src/**').should().haveNoCycles()));
