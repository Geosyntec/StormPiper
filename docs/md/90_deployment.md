# Source Code and Deployment

## Source Code Information

Source code is available for the public at the project github repository: [github.com/Geosyntec/StormPiper](https://github.com/Geosyntec/StormPiper). 

The source code is licensed under the Mozilla Public License 2.0 (MPL 2.0). 

### About the MPL 2.0

The MPL 2.0 is a free and open-source software license that allows the software to be freely used, modified, and shared under specific terms. Key highlights of the MPL 2.0 include:

- **Copyleft:** Modified files must be released under the same license, but linking is allowed without affecting the rest of the project.
- **Distribution:** You can distribute the code in both source and compiled form, provided you include the license file.
- **Attribution:** The original copyright notices must be retained in redistributed code.
- **Warranty Disclaimers and Liability Limitations:** The license includes standard provisions to protect contributors from legal claims.


You can view the full text of the MPL 2.0 license and specific details regarding the StormPiper project in the GitHub repository at:

[https://github.com/Geosyntec/StormPiper/blob/main/LICENSE](https://github.com/Geosyntec/StormPiper/blob/main/LICENSE)

Please refer to the `LICENSE` file within the repository for the complete terms and conditions governing the use of the StormPiper source code.

## Local Development

### Pre-requisites

Ensure you have Git, Python, Conda, and Docker installed on your system.

### Getting Started

Follow the steps below to get the app up and running on your system:

#### Clone the Repository

First, clone the StormPiper repository:

```shell
git clone git@github.com:Geosyntec/StormPiper.git
```

#### Build and Activate a Virtual Environment

Next, create a virtual environment using Conda and activate it:

```shell
conda create -n stormpiper python=3.11
conda activate stormpiper
```

#### Install the Required Dependencies

Navigate to the StormPiper directory and install the necessary dependencies:

```shell
cd StormPiper
pip install -r stormpiper/requirements.txt
pip install -r stormpiper/requirements_test.txt
```

### Running the Development Server

Run the development server with the following command:

```shell
uvicorn stormpiper.main:app --reload --port 8000
```

You can access the documentation at `localhost:8000/docs`.

### Making Changes and Maintenance

#### Running Tests

Run the tests using:

```shell
pytest
```

To check test coverage:

```shell
coverage run --branch -m pytest
coverage report -m
```

#### Code Formatting and Type Checks

Use the provided script to check code formatting and type declarations:

```shell
bash scripts/lint.sh
```

### Docker Deployment

#### Building the Container

Use the following command to build the container. It runs `make clean`, `make stack`, and then `make build`:

```shell
make develop
```

#### Running the Container

Start the container with:

```shell
make up
```

You can access the development server at `localhost:8080`.

To silence the logs, run the container in `daemon` mode:

```shell
make up-d
```

#### Stopping the Container

Stop the container by using:

```shell
make down
```

## Deployment 

Deploying the applicaiton on your own server requires knowledge of Kubernetes. Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. It provides mechanisms for deploying and managing applications across multiple servers, ensuring high availability and scalability.

See the [Kubernetes documentation](https://cloud.google.com/kubernetes-engine/docs) on Google Cloud Plaform for more information.

## Deployment configuration 

See the deployment scripts on the github repo for examples on how this applicaiton was deployed: [https://github.com/Geosyntec/StormPiper/tree/main/.github/workflows](github.com/Geosyntec/StormPiper/tree/main/.github/workflows)

