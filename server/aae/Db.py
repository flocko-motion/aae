import mysql.connector
from mysql.connector import pooling


class Db:

    def __init__(self):
        self.db = None
        self.connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mysql_pool",
                                                                           pool_size=5,
                                                                           pool_reset_session=True,
                                                                           host='localhost',
                                                                           database='aae',
                                                                           user='aae',
                                                                           password='jagW]Kwh7"3dD=L*^',
                                                                           auth_plugin='mysql_native_password')

    def db_cursor(self):
        return self.connection_pool.get_connection().cursor()

    def query(self, query, data=None):
        try:
            conn = self.connection_pool.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, data)
            rows = cursor.fetchall()
            conn.commit()
        except mysql.connector.errors.ProgrammingError as error:
            print('MySQL Error: ' + repr(error))
            raise
        finally:
            cursor.close()
            conn.close()
        return rows


db = Db()
