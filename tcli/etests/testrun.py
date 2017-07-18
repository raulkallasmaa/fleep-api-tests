"""Script used to run nosetests"""

import argparse
import nose
import logging

logging.basicConfig(
    format="%(asctime)s %(filename)s - %(levelname)s:\n\t %(message)s",
    datefmt="%H:%M:%S")

ROOT = logging.getLogger()
ROOT.setLevel(logging.ERROR)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument("-t", "--tests", nargs="*",
            help = "tests to be run")
    args = vars(parser.parse_args())

    tests = args["tests"] or []

    nose.main(argv=[
        "NOEXECUTABLE",
        "etests.etest:TestEmail",
        "--nologcapture",
        #"--no-byte-compile",
        "--stop"])
