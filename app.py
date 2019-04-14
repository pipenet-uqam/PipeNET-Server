import datetime
import json
import threading

from flask import Flask, render_template, Response
from time import sleep
from concurrent.futures import ThreadPoolExecutor
import socket
import queue
import sys

app = Flask(__name__, static_url_path="", static_folder="static")
executor = ThreadPoolExecutor(2)

# Create a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("", 5566))

q = queue.Queue(5)
data = []
data_lock = threading.Lock()

new_data_condition = threading.Condition()


def event_stream():
    with data_lock:
        for d in data:
            yield ('data: %s \n\n' % (d))

    while True:
        with new_data_condition:
            new_data_condition.wait()
            yield ('data: %s \n\n' % (data[-1]))


@app.route('/')
def page_accueil():
    return render_template('accueil.html')


@app.route('/stream')
def stream():
    return Response(event_stream(), mimetype="text/event-stream")


def sensor_data_listener():
    print("Task #1 started!")
    n = 0

    while True:
        data, server = sock.recvfrom(1024)
        data = data.decode("utf-8").split('|')

        id = data[0]
        t = float.fromhex(data[1])
        p = float.fromhex(data[2])

        q.put(json.dumps({'id': n, 'sensor_id': id, 't': t, 'p': p, 'time': str(datetime.datetime.now().isoformat())}))
        n = n + 1


def sensor_data_manager():
    while True:
        d = q.get()
        q.task_done()

        with new_data_condition:
            with data_lock:
                data.append(d)
                print(d)
            new_data_condition.notify_all()


if __name__ == '__main__':
    executor.submit(sensor_data_manager)
    executor.submit(sensor_data_listener)
    app.run(threaded=True)
