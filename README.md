# StormPiper

## Get Started

1. clone the repo

   ```
   git clone git@github.com:Geosyntec/StormPiper.git
   ```

2. build & activate an environment

   ```
   conda create -n stormpiper python=3.8
   conda activate stormpiper
   ```

3. install dependencies

   ```
   cd StormPiper
   pip install -r stormpiper/requirements.txt
   pip install -r stormpiper/requirements_test.txt
   ```

## Try it out

Run the development server From the StormPiper/stormpiper directory:

```
uvicorn stormpiper.main:app --reload --port 8000
```

Navigate to localhost:8000/docs in your browser

## Making Changes and Maintaining

### Run the tests

```
pytest
```

Check test coverage

```
coverage run --branch -m pytest
coverage report -m
```

### Check formatting and type declarations

from StormPiper directory

```
bash scripts/lint.sh
```


## get started with docker

### Build the container
```
make develop
```

### Run the container
```
make up
make dev-server
```

dev-server runs on localhost:8080

### Stop the container
```
make down
```