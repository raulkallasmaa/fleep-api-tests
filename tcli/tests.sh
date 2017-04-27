#! /bin/sh

#set -x

cd $FLEEP_GIT_DIR/tests

tcli() {
  ../python/tcli.py -q "$@"
}

scli() {
  ../python/syscli.py -q "$@"
}

run_test() {
    echo "$1"
    tcli $1 > testresults/$1
    git diff -w testresults/$1 | cat
}

scli register_full "tester@fleep.ee" "****" "tester" "tester@fleep.ee"
scli register_full "asko@fleep.ee" "****" "tasko" "asko@fleep.ee"
scli register "juser@dev3.fleep.ee" "****" "juser@dev3.fleep.ee"
scli register_full "marko@fleep.ee" "****" "tmarko" "marko@fleep.ee"
scli register "andres@fleep.ee" "****" "andres@fleep.ee"

run_test test_login
run_test test_dialog 
run_test test_crapnet
run_test test_check 
run_test test_presence
run_test test_org
run_test test_read
run_test test_message 
run_test test_team
run_test test_label
run_test test_show 
run_test test_topic 
run_test test_config
run_test test_pin 
run_test test_memory  
run_test test_disclose
run_test test_close
run_test test_convlist
run_test test_file
run_test test_flag
run_test test_hook
run_test test_import
run_test test_reset
run_test test_alias
run_test test_members
run_test test_task
run_test test_search
run_test test_premium
run_test test_store_message
run_test test_store_conv
run_test test_contacts
run_test test_large
run_test test_velocity
run_test test_trial

git status | grep test_

#  run email tests
cd ../python
python etests/testrun.py

