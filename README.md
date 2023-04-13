# StormPiper

## Get Started

1. clone the repo

    ```shell
    git clone git@github.com:Geosyntec/StormPiper.git
    ```

2. build & activate an environment

    ```shell
    conda create -n stormpiper python=3.11
    conda activate stormpiper
    ```

3. install dependencies

    ```shell
    cd StormPiper
    pip install -r stormpiper/requirements.txt
    pip install -r stormpiper/requirements_test.txt
    ```

## Try it out

Run the development server From the StormPiper/stormpiper directory:

```shell
uvicorn stormpiper.main:app --reload --port 8000
```

Navigate to localhost:8000/docs in your browser

## Making Changes and Maintaining

### Run the tests

```shell
pytest
```

Check test coverage

```shell
coverage run --branch -m pytest
coverage report -m
```

### Check formatting and type declarations

from StormPiper directory

```shell
bash scripts/lint.sh
```

## get started with docker

### Build the container

This command runs `make clean`, then `make stack`, then `make build`

```shell
make develop
```

### Run the container

if a startup command is set for the container, this will run it.

```shell
make up
```

The development server runs on your localhost:8080

if you want to silence the logs you can bring things up in `daemon` mode with:

```shell
make up-d
```

### Stop the container

```shell
make down
```
