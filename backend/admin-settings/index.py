import json
import os
import psycopg2

def get_db_connection():
    '''Создает соединение с базой данных'''
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: dict, context) -> dict:
    '''API для управления настройками дизайна и блоков сайта из админ-панели'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            cursor.execute('SELECT setting_key, setting_value FROM site_settings')
            settings_rows = cursor.fetchall()
            settings = {}
            for row in settings_rows:
                try:
                    settings[row[0]] = json.loads(row[1]) if isinstance(row[1], str) else row[1]
                except:
                    settings[row[0]] = row[1]
            
            cursor.execute('''
                SELECT block_id, block_type, title, position_x, position_y, 
                       width, height, visible 
                FROM layout_blocks 
                ORDER BY block_id
            ''')
            blocks_rows = cursor.fetchall()
            blocks = []
            for row in blocks_rows:
                blocks.append({
                    'id': row[0],
                    'type': row[1],
                    'title': row[2],
                    'position': {'x': row[3], 'y': row[4]},
                    'size': {'width': row[5], 'height': row[6]},
                    'visible': row[7]
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'settings': settings,
                    'blocks': blocks
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            if 'colors' in body:
                colors = body['colors']
                for key in ['primary', 'secondary', 'background']:
                    if key in colors:
                        cursor.execute('''
                            INSERT INTO site_settings (setting_key, setting_value, updated_at)
                            VALUES (%s, %s, CURRENT_TIMESTAMP)
                            ON CONFLICT (setting_key) 
                            DO UPDATE SET setting_value = EXCLUDED.setting_value, 
                                          updated_at = CURRENT_TIMESTAMP
                        ''', (f'{key}_color', json.dumps(colors[key])))
            
            if 'blocks' in body:
                for block in body['blocks']:
                    cursor.execute('''
                        UPDATE layout_blocks 
                        SET position_x = %s, position_y = %s, 
                            width = %s, height = %s, 
                            visible = %s, updated_at = CURRENT_TIMESTAMP
                        WHERE block_id = %s
                    ''', (
                        block['position']['x'], block['position']['y'],
                        block['size']['width'], block['size']['height'],
                        block['visible'], block['id']
                    ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'Settings saved'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }