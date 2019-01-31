"""
Example service

"""
import time
import cmdb.process_management.service
from cmdb.utils import get_logger
LOGGER = get_logger()

class ExampleService(cmdb.process_management.service.AbstractCmdbService):
    """Example implementation of AbstractCmdbService
    """

    def __init__(self):
        super(ExampleService, self).__init__()
        self._name = "service1"
        self._eventtypes = ["cmdb.core.#", "cmdb.service1.#"]

    def _run(self):
        LOGGER.info("{}: start run".format(self._name))
        while not self._event_shutdown.is_set():
            time.sleep(10)
        LOGGER.info("{}: end run".format(self._name))

    def _handle_event(self, event):
        LOGGER.info("{}: event received: {}".format(self._name, event))