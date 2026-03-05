# Generated manually - add "other" to PostShare.plataform choices

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0016_alter_post_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="postshare",
            name="plataform",
            field=models.CharField(
                blank=True,
                choices=[
                    ("facebook", "Facebook"),
                    ("twitter", "Twitter"),
                    ("linkedin", "LinkedIn"),
                    ("whatsapp", "WhatsApp"),
                    ("telegram", "Telegram"),
                    ("other", "Other"),
                ],
                max_length=50,
                null=True,
            ),
        ),
    ]
