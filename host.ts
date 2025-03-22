import * as os from 'node:os';

const IMAGE = 'client';
const SOCKETS_DIR = '/app/sockets';
const DOCKER_API_VERSION = '1.48'; // docker version --format '{{.Server.APIVersion}}
const DOCKER_UNIX_SOCKET = '/var/run/docker.sock';

const { uid, gid } = os.userInfo();

async function createContainer(): Promise<{ Id: string }> {
  const response = await fetch(`http://localhost/v${DOCKER_API_VERSION}/containers/create`, {
    method: 'POST',
    unix: DOCKER_UNIX_SOCKET,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Image: IMAGE,
      Env: [`SOCKETS_DIR=${SOCKETS_DIR}`],
      User: `${uid}:${gid}`,
      HostConfig: {
        GroupAdd: [gid.toString()],
        Binds: [
          `sockets:${SOCKETS_DIR}`,
        ],
        Ulimits: [
          {
            Name: "memlock",
            Soft: -1,
            Hard: -1,
          },
        ],
      },
      Detach: true,
    }),
  });
  return await response.json();
}

async function startContainer(id: string) {
  const response = await fetch(`http://localhost/v${DOCKER_API_VERSION}/containers/${id}/start`, {
    method: 'POST',
    unix: DOCKER_UNIX_SOCKET,
  });
  return await response.json();
}

async function stopContainer(id: string) {
  const response = await fetch(`http://localhost/v${DOCKER_API_VERSION}/containers/${id}/stop`, {
    method: 'POST',
    unix: DOCKER_UNIX_SOCKET,
  });
  return await response.json();
}

async function getContainer(id: string) {
  const response = await fetch(`http://localhost/v${DOCKER_API_VERSION}/containers/${id}/json`, {
    method: 'GET',
    unix: DOCKER_UNIX_SOCKET,
  });
  return await response.json();
}

async function getContainerLogs(id: string) {
  const url = new URL(`http://localhost/v${DOCKER_API_VERSION}/containers/${id}/logs`);
  url.searchParams.set('stdout', 'true');
  url.searchParams.set('stderr', 'true');
  url.searchParams.set('tail', '100');
  url.searchParams.set('timestamps', 'false');
  const response = await fetch(url, {
    method: 'GET',
    unix: DOCKER_UNIX_SOCKET,
  });
  return await response.text();
}

console.time('client');

const container = await createContainer();

await startContainer(container.Id);

try {
  {
    const { State } = await getContainer(container.Id);
    if (State.Status !== 'running') {
      console.log(State);
      const logs = await getContainerLogs(container.Id);
      console.log(logs);
      throw new Error('Failed to start container');
    }
  }

  const response = await fetch('http://localhost', {
    method: 'POST',
    unix: socket,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hello: 'world' })
  });
  console.log(await response.json());
} finally {
  await stopContainer(container.Id);
  console.timeEnd('client');
}
